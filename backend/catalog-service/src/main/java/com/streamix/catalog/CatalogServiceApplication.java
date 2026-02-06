//This is the main entry point. When you run this,
// it starts the embedded Tomcat server, connects to the database, and registers the service with Eureka.
package com.streamix.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CatalogServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CatalogServiceApplication.class, args);
	}

}



//Flow -
//request to GET http://localhost:8080/movie/all
/*
Gateway (8080): Receives the request and routes it to Catalog Service.
Controller: The getAllMovies() method is triggered. It calls the Service.
Service: Calls the Repository.
Repository: Runs the SQL SELECT * FROM movies against Supabase.
Database: Returns the rows.
Repository -> Service -> Controller: The data travels back up the chain.
Controller: Converts the Java List into a JSON array and sends it to your screen.
*/