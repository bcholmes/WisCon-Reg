
create table reg_perennial_con_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name varchar(90) not null,
    website_url varchar(255) not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
    currency char(3) NOT NULL DEFAULT 'USD',
    emphasis char(1) NOT NULL DEFAULT 'N',
    is_membership char(1) NOT NULL DEFAULT 'N',
    add_prompts char(1) NOT NULL DEFAULT 'N',
    email_required varchar(16) NOT NULL DEFAULT 'NO',
    description varchar(2048),

    FOREIGN KEY (con_id)
        REFERENCES reg_con_info(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reg_offering_highlight (
    offering_id INT NOT NULL,
    sort_order INT NOT NULL,
    highlight_text varchar(1024),
    PRIMARY KEY(offering_id, sort_order),

    FOREIGN KEY (offering_id)
        REFERENCES reg_offering(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
1, 'Available only to previous Guests of Honor'
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

insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(3, 'Teen Membership', 1, '2022-05-31 23:59:59', 20.00, 
'Our weekend membership for teen guests (anyone 13 to 18 as of 2022-05-30/Memorial Day, last day of the convention).', 
'Y', 'Y', 'OPTIONAL');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 13-18'
from reg_offering;

insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(4, 'Youth Membership', 1, '2022-05-31 23:59:59', 20.00, 
'Our weekend membership for young guests (anyone 7 to 12 as of 2022-05-30/Memorial Day, last day of the convention).', 
'Y', 'Y', 'OPTIONAL');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Full Weekend (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 7-12'
from reg_offering;


insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(5, 'WisCon Child Care', 1, '2022-05-31 23:59:59', 0.00, 
'Child Membership (Ages 0-6) for WisCon 45 in May 2022. Includes on-site child care by licensed providers during the day, on each day of the convention (check wiscon.net for details and hours).', 
'Y', 'N', 'NO');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'On-site daytime child care by licensed providers (Thu-Mon)'
from reg_offering;

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Ages 0-6'
from reg_offering;


insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(6, 'Supporting Membership', 1, '2022-05-31 23:59:59', 25.00, 
'A non-attending membership for the convention. Supporting Members will receive any announcements and mailings sent to the general membership, as well as a physical copy of our program and souvenir book (requires a mailing address).', 
'Y', 'N', 'NO');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'A non-attending membership'
from reg_offering;

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Receive printed materials, by mail'
from reg_offering;

insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(7, 'Dessert Ticket', 1, '2022-05-31 23:59:59', 35.00, 
'Ticket for the Dessert Salon on Sunday evening of WisCon 45 in 2020, including two desserts from the buffet. (Proceeds from the Dessert Salon help to offset the costs of other aspects of the convention.)', 
'N', 'N', 'NO');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Sunday Evening Dessert Salon'
from reg_offering;

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
2, 'Two desserts'
from reg_offering;

insert into reg_offering 
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, email_required)
values
(8, 'Donate to Wiscon/SF3', 1, '2022-05-31 23:59:59',  
'Thank you for supporting WisCon! Donations in this category will go to the general fund for SF3, WisCon''s parent organization, and will support the convention as well as other SF3 activities.', 
'N', 'N', 'NO');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Donations to the general fund for SF3, WisCon''s parent organization'
from reg_offering;


insert into reg_offering 
(sort_order, title, con_id, end_time, description, is_membership, add_prompts, email_required)
values
(9, 'Donate to WMAF', 1, '2022-05-31 23:59:59',  
'Donations to the WisCon Member Assistance Fund, which supports anyone who needs financial assistance to attend the convention. To learn more, including about how to apply to the Member Assistance Fund yourself, visit https://wiscon.net/assistance-fund/ ', 
'N', 'N', 'NO');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'The WisCon Member Assistance Fund supports anyone who needs financial assistance to attend'
from reg_offering;

create table reg_order (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_uuid varchar(36) NOT NULL,
    status varchar(32) NOT NULL DEFAULT 'IN_PROGRESS',
    creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
    last_modified_date TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    payment_date TIMESTAMP NULL DEFAULT NULL,
    payment_method varchar(32),
    con_id INT NOT NULL,
    FOREIGN KEY (con_id)
        REFERENCES reg_con_info(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table reg_order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    order_id INT NOT NULL,
    for_name varchar(255) NOT NULL,
    email_address varchar(255) NULL DEFAULT NULL,
    amount decimal(13,2) NOT NULL DEFAULT 0,
    email_ok char(1),
    volunteer_ok char(1),
    snail_mail_ok char(1),
    FOREIGN KEY (offering_id)
        REFERENCES reg_offering(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,
    FOREIGN KEY (order_id)
        REFERENCES reg_order(id)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

alter table reg_order add column payment_intent_id varchar(1024);

alter table reg_order_item add column street_line_1 varchar(1024);
alter table reg_order_item add column street_line_2 varchar(1024);
alter table reg_order_item add column city varchar(255);
alter table reg_order_item add column state_or_province varchar(255);
alter table reg_order_item add column zip_or_postal_code varchar(255);
alter table reg_order_item add column country varchar(1024);

alter table reg_offering add column address_required char(1) not null default 'N';

update reg_offering set sort_order = sort_order * 10;

insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(25, 'Online Membership', 1, '2022-05-31 23:59:59', 40.00, 
'The Online Membership provides access to the online portion of WisCon 2022 (visit https://wiscon.net/register/ for more information)', 
'Y', 'Y', 'REQUIRED');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Online Access to Streamed Events'
from reg_offering;

alter table reg_offering add column age_required char(1) not null default 'N';

update reg_offering set age_required = 'Y' where title = 'WisCon Child Care';

alter table reg_order_item add column age varchar(255);

insert into reg_offering 
(sort_order, title, con_id, end_time, suggested_price, description, is_membership, add_prompts, email_required)
values
(27, 'Online Teen Membership', 1, '2022-05-31 23:59:59', 20.00, 
'The Online Teen Membership provides access to the online portion of WisCon 2022 (visit https://wiscon.net/register/ for more information)', 
'Y', 'Y', 'OPTIONAL');

insert into reg_offering_highlight 
(offering_id, sort_order, highlight_text)
select max(id),
1, 'Online Access to Streamed Events'
from reg_offering;

create table reg_program_link (
    con_id int not null,
    order_item_id int not null,
    badgeid varchar(15) not null,

    FOREIGN KEY (con_id)
        REFERENCES reg_con_info(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,
    FOREIGN KEY (order_item_id)
        REFERENCES reg_order_item(id)
        ON UPDATE RESTRICT ON DELETE CASCADE,
    FOREIGN KEY (`badgeid`)
        REFERENCES `Participants`(`badgeid`)
        ON UPDATE RESTRICT ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;