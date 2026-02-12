/**
 * OpenRouter AI Service
 * 
 * Handles communication with OpenRouter API for SQL/DBMS focused conversations.
 * Implements model fallback chain for reliability.
 */

// Model configuration with fallback chain
// Using free/open-source models only
const MODELS = {
    primary: 'google/gemini-2.0-flash-001',
    fallback1: 'mistralai/mistral-small-3.1-24b-instruct',
    fallback2: 'meta-llama/llama-3.3-8b-instruct',
} as const;

// System prompt that enforces SQL/DBMS focus
const SYSTEM_PROMPT = `You are a friendly and professional SQL and Database Management System (DBMS) assistant integrated into a database visualiser app.

IMPORTANT RULES:
1. You PRIMARILY answer questions related to SQL, databases, and DBMS concepts.
2. You ALSO handle basic conversational greetings and pleasantries naturally. Respond warmly to "Hi", "Hello", "Hey", "Thanks", "Thank you", "Bye", "Good morning", etc. Keep greeting responses short and friendly, and gently mention you can help with SQL questions.
3. Provide educational, accurate, and professional responses.
4. Include SQL syntax examples when relevant, using standard SQL or MySQL syntax. Wrap SQL in markdown code blocks (e.g. \`\`\`sql ... \`\`\`).
5. NEVER pretend to execute queries or access any actual database.
6. If asked about non-database topics (other than basic greetings), politely redirect to SQL/DBMS topics.
7. Keep responses concise but comprehensive.
8. Use proper SQL formatting with appropriate capitalization of SQL keywords.
9. When explaining query results or errors, be clear and provide examples.

You help users understand:
- SQL syntax (SELECT, INSERT, UPDATE, DELETE, etc.)
- Database design and normalization
- Joins, indexes, and constraints  
- Stored procedures and functions
- Database optimization and best practices
- ACID properties and transactions
- Query results interpretation and debugging SQL errors`;

// Maximum input length to prevent abuse
const MAX_INPUT_LENGTH = 1000;

// Types
interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface OpenRouterResponse {
    id: string;
    choices: {
        message: {
            content: string;
        };
    }[];
    error?: {
        message: string;
        code?: string;
    };
}

interface ChatResponse {
    success: boolean;
    message: string;
    sql?: string[];
    model?: string;
    error?: string;
}

/**
 * Extracts SQL queries from AI response text
 * Looks for SQL code blocks (```sql ... ```) and standalone SQL statements
 */
function extractSQLQueries(text: string): { cleanedText: string; sqlQueries: string[] } {
    const sqlQueries: string[] = [];
    let cleanedText = text;

    // Pattern 1: Extract SQL from markdown code blocks (```sql ... ``` or ``` ... ```)
    const codeBlockRegex = /```(?:sql)?\s*([\s\S]*?)```/gi;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
        const sqlContent = match[1].trim();
        if (sqlContent && isSQLStatement(sqlContent)) {
            sqlQueries.push(sqlContent);
        }
    }

    // Remove code blocks from the text for cleaner display
    cleanedText = cleanedText.replace(codeBlockRegex, '').trim();

    // Pattern 2: If no code blocks found, look for standalone SQL statements
    if (sqlQueries.length === 0) {
        const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|USE|SHOW|DESCRIBE|EXPLAIN)\b/i;
        const lines = text.split('\n');
        const potentialSQL: string[] = [];
        let inStatement = false;
        let currentStatement = '';

        for (const line of lines) {
            const trimmedLine = line.trim();

            // Check if this line starts a SQL statement
            if (sqlKeywords.test(trimmedLine) && !inStatement) {
                inStatement = true;
                currentStatement = trimmedLine;
            } else if (inStatement) {
                currentStatement += '\n' + trimmedLine;
            }

            // Check if statement ends (with semicolon or empty line)
            if (inStatement && (trimmedLine.endsWith(';') || trimmedLine === '')) {
                if (currentStatement.trim()) {
                    potentialSQL.push(currentStatement.trim());
                }
                inStatement = false;
                currentStatement = '';
            }
        }

        // Add any remaining statement
        if (currentStatement.trim()) {
            potentialSQL.push(currentStatement.trim());
        }

        // Validate and add to sqlQueries
        for (const sql of potentialSQL) {
            if (isSQLStatement(sql)) {
                sqlQueries.push(sql);
            }
        }
        // Remove extracted standalone SQL from the cleaned text
        for (const sql of sqlQueries) {
            // Escape special regex characters in the SQL
            const escapedSQL = sql.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            cleanedText = cleanedText.replace(new RegExp(escapedSQL, 'gi'), '');
        }
    }

    // Clean up multiple newlines in the cleaned text
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n').trim();

    return { cleanedText, sqlQueries };
}

/**
 * Validates if a string looks like a valid SQL statement
 */
function isSQLStatement(text: string): boolean {
    const sqlKeywords = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|GRANT|REVOKE|USE|SHOW|DESCRIBE|EXPLAIN|WITH)\b/i;
    return sqlKeywords.test(text.trim());
}

/**
 * Validates user input before sending to API
 */
function validateInput(message: string): { valid: boolean; error?: string } {
    if (!message || typeof message !== 'string') {
        return { valid: false, error: 'Message is required and must be a string' };
    }

    const trimmed = message.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: 'Message cannot be empty' };
    }

    if (trimmed.length > MAX_INPUT_LENGTH) {
        return { valid: false, error: `Message too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.` };
    }

    return { valid: true };
}

/**
 * Makes a request to OpenRouter API with a specific model
 */
async function callOpenRouter(
    model: string,
    messages: OpenRouterMessage[],
    apiKey: string
): Promise<OpenRouterResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://database-visualiser.app', // Site URL for OpenRouter rankings
            'X-Title': 'Database Visualiser', // App name for OpenRouter dashboard
        },
        body: JSON.stringify({
            model,
            messages,
            max_tokens: 1024,
            temperature: 0.7,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    return response.json();
}

/**
 * Main function to get AI response with model fallback
 * 
 * Tries models in order: Mistral → Falcon → GPT-J
 * Returns first successful response or error if all fail
 */
export async function getOpenRouterResponse(userMessage: string): Promise<ChatResponse> {
    // Validate input
    const validation = validateInput(userMessage);
    if (!validation.valid) {
        return {
            success: false,
            message: '',
            error: validation.error,
        };
    }

    // Get API key from environment
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        console.error('OPENROUTER_API_KEY is not configured');
        return {
            success: false,
            message: '',
            error: 'AI service is not configured. Please contact support.',
        };
    }

    // Prepare messages for OpenRouter
    const messages: OpenRouterMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage.trim() },
    ];

    // Model fallback chain
    const modelChain = [MODELS.primary, MODELS.fallback1, MODELS.fallback2];

    for (const model of modelChain) {
        try {
            console.log(`[OpenRouter] Trying model: ${model}`);

            const response = await callOpenRouter(model, messages, apiKey);

            // Check for API-level errors
            if (response.error) {
                console.warn(`[OpenRouter] Model ${model} returned error:`, response.error.message);
                continue; // Try next model
            }

            // Extract response content
            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                console.warn(`[OpenRouter] Model ${model} returned empty response`);
                continue; // Try next model
            }

            console.log(`[OpenRouter] Success with model: ${model}`);

            // Extract SQL queries from the response
            const { cleanedText, sqlQueries } = extractSQLQueries(content.trim());

            return {
                success: true,
                message: cleanedText || content.trim(),
                sql: sqlQueries.length > 0 ? sqlQueries : undefined,
                model,
            };

        } catch (error) {
            console.error(`[OpenRouter] Model ${model} failed:`, error instanceof Error ? error.message : error);
            // Continue to next model in fallback chain
        }
    }

    // All models failed
    console.error('[OpenRouter] All models in fallback chain failed');
    return {
        success: false,
        message: '',
        error: 'Unable to get a response at this time. Please try again later.',
    };
}

export { MAX_INPUT_LENGTH };
