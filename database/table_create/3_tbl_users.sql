create table tbl_users
(
    id                     int auto_increment
        primary key,
    name                   char(32)                           not null,
    password               text                               not null,
    registration_timestamp datetime default CURRENT_TIMESTAMP null,
    constraint tbl_users_name_uindex
        unique (name)
);