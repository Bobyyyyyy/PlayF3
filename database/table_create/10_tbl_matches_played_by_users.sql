CREATE TABLE tbl_matches_played_by_users
(
    match_id   INT PRIMARY KEY,
    white      INT     DEFAULT NULL,
    black      INT     DEFAULT NULL,
    elo_gained TINYINT DEFAULT 0 NOT NULL,
    elo_loss   TINYINT DEFAULT 0 NOT NULL,
    FOREIGN KEY (match_id) REFERENCES tbl_matches (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (white) REFERENCES tbl_users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (black) REFERENCES tbl_users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE tbl_matches
    ADD time_seconds INT DEFAULT 0 COMMENT 'Time limit';
