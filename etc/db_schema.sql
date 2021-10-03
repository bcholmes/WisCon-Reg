
create table reg_perennial_con_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(90) not null,
    website_url varchar(255) not null
);

create table reg_con_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    perennial_con_id INT NOT NULL,
    name VARCHAR(90) NOT NULL,
    header_img_name VARCHAR(90),
    active_from_time TIMESTAMP NOT NULL DEFAULT NOW(),
    active_to_time TIMESTAMP NOT NULL DEFAULT NOW(),
    reg_open_time TIMESTAMP NOT NULL DEFAULT NOW(),
    reg_close_time TIMESTAMP NOT NULL DEFAULT NOW(),
    con_start_date DATE NOT NULL,
    con_end_date DATE NOT NULL,
    FOREIGN KEY (perennial_con_id)
        REFERENCES reg_perennial_con_info (id)
        ON UPDATE RESTRICT ON DELETE CASCADE
);


insert into reg_perennial_con_info (name, website_url) 
values ('WisCon', 'https://wiscon.net');


insert into reg_con_info (name, perennial_con_id, con_start_date, con_end_date) 
select 'WisCon 44', max(id), '2022-05-26', '2022-05-30'
from reg_perennial_con_info;

create view reg_users as 
SELECT P.badgeid, P.password, C.firstname, C.lastname, C.badgename, C.email
    FROM
                Participants P
        JOIN CongoDump C ON P.badgeid = C.badgeid
         and P.badgeid in 
    (select badgeid from 
        PermissionRoles PR
        LEFT JOIN UserHasPermissionRole UHPR ON UHPR.permroleid = PR.permroleid
        where PR.permrolename = 'Registration');