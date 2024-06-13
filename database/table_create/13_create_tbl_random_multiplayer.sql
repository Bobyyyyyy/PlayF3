CREATE TABLE tbl_random_multiplayer(
    match_shadow VARCHAR(768) NOT NULL,
    deleted TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (match_shadow)
)