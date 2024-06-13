create table tbl_matches
(
    id              int auto_increment
        primary key,
    start_timestamp datetime default CURRENT_TIMESTAMP   not null,
    type            enum ('SINGLEPLAYER', 'MULTIPLAYER') not null,
    deleted         tinyint  default 0                   null comment 'Realizza l''eliminazione logica. 0 se non è stato cancellato, 1 altrimenti',
    status          tinyint  default 0                   null comment '0 = Non iniziata, 1 = in corso, 2 = Terminata.'
);
