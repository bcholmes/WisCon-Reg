
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

create table reg_offering (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sort_order INT NOT NULL,
    title varchar(255) NOT NULL,
    con_id INT NOT NULL,
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP NOT NULL DEFAULT NOW(),
    minimum_price decimal(13,2),
    suggested_price decimal(13,2),
    maximum_price decimal(13,2),
    emphasis char(1) NOT NULL DEFAULT 'N',
    is_membership char(1) NOT NULL DEFAULT 'N',
    add_prompts char(1) NOT NULL DEFAULT 'N',
    email_required varchar(16) NOT NULL DEFAULT 'NO',
    description varchar(2048),

    FOREIGN KEY (con_id)
        REFERENCES reg_con_info(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
);

create table reg_offering_highlight (
    offering_id INT NOT NULL,
    sort_order INT NOT NULL,
    highlight_text varchar(1024),
    PRIMARY KEY(offering_id, sort_order),

    FOREIGN KEY (offering_id)
        REFERENCES reg_offering(id)
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



insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(1, 'Former GoH', 1, '2022-05-31 23:59:59', 0.00, 'Available only to previous Guests of Honor.', 'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Available only to previous Guests of Honor.'
from reg_offering;

insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, emphasis, email_required)
values
(2, 'Adult Membership', 1, '2022-05-31 23:59:59', 65.00, 
'Our standard membership for adult guests (anyone 19 or older as of 2022-05-30/Memorial Day, last day of the convention).', 
'Y', 'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 19+'
from reg_offering;




