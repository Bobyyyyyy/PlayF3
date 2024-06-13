CREATE TABLE tbl_weekly_situations (

    start_of_week     DATE    NOT NULL PRIMARY KEY,
    situation    varchar(128)    NOT NULL,
    creation_timestamp   datetime   default CURRENT_TIMESTAMP

);