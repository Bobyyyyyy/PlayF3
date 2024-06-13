CREATE TABLE `tbl_weekly_results`
(
    `id`               INTEGER AUTO_INCREMENT PRIMARY KEY,
    `weekly_match`     DATE    NOT NULL,
    `match_id`         INT     NOT NULL,
    `user_id`          INT     NOT NULL,
     FOREIGN KEY (`weekly_match`) REFERENCES tbl_weekly_situations (`start_of_week`),
     FOREIGN KEY (`match_id`) REFERENCES tbl_matches (`id`),
     FOREIGN KEY (`user_id`) REFERENCES tbl_users (`id`)
);