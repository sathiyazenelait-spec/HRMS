package com.zenelait.hrms;

import java.io.File;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RunSchema {
    public static void main(String[] args) {
        String url = "jdbc:mysql://gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/sys?useSSL=true&enabledTLSProtocols=TLSv1.2,TLSv1.3";
        String user = "4ZDgjiN8eqjM3sn.root";
        String password = "MNpFyFR12a7XNq3h";

        try {
            System.out.println("Connecting to database...");
            Connection conn = DriverManager.getConnection(url, user, password);
            System.out.println("Connected successfully!");

            File schemaFile = new File("db/schema.sql");
            if (!schemaFile.exists()) {
                schemaFile = new File("backend/db/schema.sql");
            }
            System.out.println("Reading schema file from: " + schemaFile.getAbsolutePath());
            String content = Files.readString(schemaFile.toPath());

            Statement stmt = conn.createStatement();
            
            stmt.execute("SET FOREIGN_KEY_CHECKS = 0;");
            
            // Simple split by semicolon, ignoring commented lines
            String[] statements = content.split(";");
            for (String sql : statements) {
                sql = sql.trim();
                if (sql.isEmpty()) {
                    continue;
                }
                // Strip comments
                String[] lines = sql.split("\n");
                StringBuilder cleanSql = new StringBuilder();
                for (String line : lines) {
                    if (!line.trim().startsWith("--")) {
                        cleanSql.append(line).append("\n");
                    }
                }
                String finalSql = cleanSql.toString().trim();
                if (finalSql.isEmpty()) {
                    continue;
                }
                try {
                    System.out.println("Executing: " + (finalSql.length() > 80 ? finalSql.substring(0, 80) + "..." : finalSql));
                    stmt.execute(finalSql);
                } catch (Exception e) {
                    System.err.println("Failed statement: " + finalSql);
                    System.err.println("Error: " + e.getMessage());
                }
            }
            
            stmt.execute("SET FOREIGN_KEY_CHECKS = 1;");
            
            stmt.close();
            conn.close();
            System.out.println("Schema executed successfully!");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
