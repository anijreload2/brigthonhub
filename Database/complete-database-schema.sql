-- COMPREHENSIVE DATABASE SCHEMA QUERY
-- Shows ALL tables and ALL columns in the entire database

SELECT 
    t.table_schema,
    t.table_name,
    c.ordinal_position,
    c.column_name,
    c.data_type,
    CASE 
        WHEN c.character_maximum_length IS NOT NULL THEN 
            c.data_type || '(' || c.character_maximum_length || ')'
        WHEN c.numeric_precision IS NOT NULL AND c.numeric_scale IS NOT NULL THEN 
            c.data_type || '(' || c.numeric_precision || ',' || c.numeric_scale || ')'
        WHEN c.numeric_precision IS NOT NULL THEN 
            c.data_type || '(' || c.numeric_precision || ')'
        ELSE c.data_type
    END AS full_data_type,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FK → ' || fk.foreign_table_name || '.' || fk.foreign_column_name
        ELSE ''
    END AS constraints,
    CASE 
        WHEN c.is_identity = 'YES' THEN 'IDENTITY'
        WHEN c.is_generated = 'ALWAYS' THEN 'GENERATED'
        ELSE ''
    END AS special_attributes
FROM 
    information_schema.tables t
JOIN 
    information_schema.columns c ON t.table_name = c.table_name AND t.table_schema = c.table_schema
LEFT JOIN (
    -- Primary key information
    SELECT 
        tc.table_schema,
        kcu.table_name,
        kcu.column_name
    FROM 
        information_schema.table_constraints tc
    JOIN 
        information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
    WHERE 
        tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_schema = pk.table_schema AND c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    -- Foreign key information
    SELECT 
        tc.table_schema,
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM 
        information_schema.table_constraints tc
    JOIN 
        information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
    JOIN 
        information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_schema = fk.table_schema AND c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE 
    t.table_type = 'BASE TABLE'
    AND t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY 
    t.table_schema,
    t.table_name, 
    c.ordinal_position;
