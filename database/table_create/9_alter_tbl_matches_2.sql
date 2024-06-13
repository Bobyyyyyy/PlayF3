ALTER TABLE tbl_matches RENAME COLUMN white_won TO winner;
ALTER TABLE tbl_matches MODIFY
    winner TINYINT DEFAULT -1 COMMENT '0 - Black Won, 1 - White Won, 2 - Draw, -1 - Unknown';