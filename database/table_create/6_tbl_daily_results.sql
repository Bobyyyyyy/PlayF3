CREATE TABLE `tbl_daily_results`
(
    `id`               INTEGER,
    `daily_match`      DATE    NOT NULL,
    `match_id`         INT     NOT NULL NULL,
    `user_id`          INT     NOT NULL,
    FOREIGN KEY (`daily_match`) REFERENCES tbl_daily_situations (`day`),
    FOREIGN KEY (`match_id`) REFERENCES tbl_matches (`id`),
    FOREIGN KEY (`user_id`) REFERENCES tbl_users (`id`)
);