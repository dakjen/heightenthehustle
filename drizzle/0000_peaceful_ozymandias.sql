CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" text NOT NULL,
	"password" varchar(256) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
