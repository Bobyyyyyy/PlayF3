create table tbl_matches_situations
(
    match_id      int          not null,
    situation_no  int          not null,
    fen_situation varchar(128) not null,
    primary key (match_id, situation_no),
    constraint tbl_matches_situations_tbl_matches_id_fk
        foreign key (match_id) references tbl_matches (id)
);
