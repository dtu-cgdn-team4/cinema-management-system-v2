package db.migration;

import org.flywaydb.core.api.FlywayException;
import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeMap;

/** Replaces the global phone uniqueness with phone-and-role uniqueness. */
public class V6__dieu_chinh_unique_nguoi_dung extends BaseJavaMigration {

    private static final String TABLE = "nguoi_dung";
    private static final String PHONE_COLUMN = "so_dien_thoai";
    private static final String ROLE_COLUMN = "vai_tro";
    private static final String NEW_CONSTRAINT = "uq_nguoi_dung_sdt_vai_tro";

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        DatabaseMetaData metadata = connection.getMetaData();
        String product = metadata.getDatabaseProductName().toLowerCase(Locale.ROOT);

        if (!product.contains("mysql") && !product.contains("h2")) {
            throw new FlywayException("V6 only supports MySQL and H2, current database: "
                    + metadata.getDatabaseProductName());
        }

        String catalog = connection.getCatalog();
        String schema = connection.getSchema();
        List<UniqueIndex> uniqueIndexes = readUniqueIndexes(metadata, catalog, schema);
        boolean compositeAlreadyExists = uniqueIndexes.stream()
                .anyMatch(index -> index.columns().equals(List.of(PHONE_COLUMN, ROLE_COLUMN)));
        List<UniqueIndex> phoneOnlyIndexes = uniqueIndexes.stream()
                .filter(index -> index.columns().equals(List.of(PHONE_COLUMN)))
                .toList();

        if (phoneOnlyIndexes.size() > 1) {
            throw new FlywayException("Multiple phone-only unique indexes found: "
                    + phoneOnlyIndexes.stream().map(UniqueIndex::name).toList());
        }
        if (phoneOnlyIndexes.isEmpty() && !compositeAlreadyExists) {
            throw new FlywayException("Phone-only unique index was not found");
        }

        if (!compositeAlreadyExists) {
            execute(connection, "ALTER TABLE " + quote(metadata, TABLE)
                    + " ADD CONSTRAINT " + quote(metadata, NEW_CONSTRAINT)
                    + " UNIQUE (" + quote(metadata, PHONE_COLUMN) + ", "
                    + quote(metadata, ROLE_COLUMN) + ")");
        }

        if (!phoneOnlyIndexes.isEmpty()) {
            if (product.contains("mysql")) {
                execute(connection, "ALTER TABLE " + quote(metadata, TABLE)
                        + " DROP INDEX " + quote(metadata, phoneOnlyIndexes.get(0).name()));
            } else {
                String constraintName = findH2PhoneOnlyConstraint(connection, schema);
                execute(connection, "ALTER TABLE " + quote(metadata, TABLE)
                        + " DROP CONSTRAINT " + quote(metadata, constraintName) + " RESTRICT");
            }
        }
    }

    @Override
    public boolean canExecuteInTransaction() {
        return false;
    }

    private List<UniqueIndex> readUniqueIndexes(DatabaseMetaData metadata, String catalog, String schema)
            throws SQLException {
        Map<String, TreeMap<Integer, String>> columnsByIndex = new LinkedHashMap<>();
        try (ResultSet indexes = metadata.getIndexInfo(catalog, schema, TABLE, true, false)) {
            while (indexes.next()) {
                String indexName = indexes.getString("INDEX_NAME");
                String columnName = indexes.getString("COLUMN_NAME");
                if (indexName == null || columnName == null) {
                    continue;
                }
                columnsByIndex.computeIfAbsent(indexName, ignored -> new TreeMap<>())
                        .put(indexes.getInt("ORDINAL_POSITION"), columnName.toLowerCase(Locale.ROOT));
            }
        }

        List<UniqueIndex> result = new ArrayList<>();
        columnsByIndex.forEach((name, columns) -> result.add(new UniqueIndex(name, List.copyOf(columns.values()))));
        return result;
    }

    private String findH2PhoneOnlyConstraint(Connection connection, String schema) throws SQLException {
        String sql = """
                SELECT tc.constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                  ON kcu.constraint_catalog = tc.constraint_catalog
                 AND kcu.constraint_schema = tc.constraint_schema
                 AND kcu.constraint_name = tc.constraint_name
                 AND kcu.table_name = tc.table_name
                WHERE LOWER(tc.table_name) = ?
                  AND LOWER(tc.constraint_schema) = LOWER(?)
                  AND tc.constraint_type = 'UNIQUE'
                GROUP BY tc.constraint_name
                HAVING COUNT(*) = 1
                   AND MAX(LOWER(kcu.column_name)) = ?
                """;
        List<String> names = new ArrayList<>();
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, TABLE);
            statement.setString(2, schema);
            statement.setString(3, PHONE_COLUMN);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    names.add(resultSet.getString(1));
                }
            }
        }
        if (names.size() != 1) {
            throw new FlywayException("Expected one H2 phone-only unique constraint, found: " + names);
        }
        return names.get(0);
    }

    private void execute(Connection connection, String sql) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute(sql);
        }
    }

    private String quote(DatabaseMetaData metadata, String identifier) throws SQLException {
        String quote = metadata.getIdentifierQuoteString().trim();
        if (quote.isEmpty()) {
            return identifier;
        }
        return quote + identifier.replace(quote, quote + quote) + quote;
    }

    private record UniqueIndex(String name, List<String> columns) {
    }
}
