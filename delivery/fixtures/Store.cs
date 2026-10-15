using Microsoft.Data.Sqlite;
public static class Store {
 public static SqliteConnection Open(){var c=new SqliteConnection("Data Source="+Environment.GetEnvironmentVariable("SQLITE_PATH")+";Default Timeout=5");c.Open();return c;}
 public static SqliteCommand Cmd(SqliteConnection c,string sql,params (string,object)[] args){var cmd=c.CreateCommand();cmd.CommandText=sql;foreach(var (key,value) in args)cmd.Parameters.AddWithValue(key,value);return cmd;}
 public static Ticket Read(SqliteDataReader r)=>new(r.GetInt64(0),r.GetString(1),r.GetString(2),r.GetInt32(3));
 public static void Init(){using var c=Open();using var q=Cmd(c,"CREATE TABLE IF NOT EXISTS tickets(id INTEGER PRIMARY KEY,owner TEXT NOT NULL,title TEXT NOT NULL,status TEXT NOT NULL,version INTEGER NOT NULL)");q.ExecuteNonQuery();}
}
