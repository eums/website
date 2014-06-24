require 'jekyll-import'
JekyllImport::Importers::WordPress.run({
   "dbname" => "eums",
   "user" => "root",
   "password" => "roflbiscuits",
   "host" => "localhost",
   "status" => ["publish"],
   "socket" => "/var/run/mysqld/mysqld.sock"
  })

