ALTER TABLE `tbl_matches`
    CHANGE
        `type` type enum ('SINGLEPLAYER', 'MULTIPLAYER', 'DAILY', 'TRAINING','WEEKLY') not null;