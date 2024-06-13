ALTER TABLE tbl_matches ADD
    `white_won` TINYINT DEFAULT 1 comment '1 if white won, false otherwise' null;
ALTER TABLE `tbl_daily_results`
    DROP `is_player_winner`;
ALTER TABLE tbl_matches MODIFY
    `white_won` TINYINT DEFAULT 0 comment '1 if white won, false otherwise' null;

alter table tbl_daily_results
    MODIFY id INTEGER AUTO_INCREMENT NOT NULL,
    add constraint tbl_daily_results_pk
        primary key (id);