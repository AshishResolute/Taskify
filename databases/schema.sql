
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS manager;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS teams;

create table teams(
    team_id int AUTO_INCREMENT primary key,
    team_task varchar(250) not null,
    team_maxMembers int default 5,
    team_admin int,
    team_currentMembers int default 0,
    created_at timestamp default current_timestamp
);

create table users(
    user_id int AUTO_INCREMENT primary key,
    user_name varchar(100),
    email varchar(200),
    password varchar(100),
    team_id int,
    user_role varchar(15),
    created_at timestamp default current_timestamp,
    foreign key (team_id) references teams(team_id) on delete set null
);

create table manager(
    manager_id int AUTO_INCREMENT primary key,
    user_id int not null unique,
    foreign key(user_id) references users(user_id) on delete cascade
);

create table tasks(
    task_id int AUTO_INCREMENT primary key,
    title varchar(50) not null,
    description varchar(150) not null,
    assigned_to int,
    assigned_by int,
    team_id int,
    status enum('Pending','In_Progress','Completed') default 'Pending',
    assign_time timestamp default current_timestamp,
    deadline timestamp,
    foreign key (assigned_to) references users(user_id) on delete set null,
    foreign key (assigned_by) references users(user_id) on delete set null,
    foreign key (team_id) references teams(team_id) on delete cascade
);

