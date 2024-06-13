create table tbl_sessions
(
    id      varchar(128) collate utf8mb4_bin not null
        primary key,
    expires int unsigned                     not null,
    data    mediumtext collate utf8mb4_bin   null
);