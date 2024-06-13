CREATE TABLE `tbl_daily_situations`
(
    `day`              DATE         NOT NULL PRIMARY KEY,
    `situation`        VARCHAR(128) NOT NULL,
    `create_timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP()
)