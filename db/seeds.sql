USE employeetracker;

INSERT INTO department(name)
VALUES  ("Research & Development"),
        ("Human Resources"),
        ("Marketing"),
        ("Engineering"),
        ("Quality Assurance"),
        ("Management");

INSERT INTO role(title, salary, department_id)
VALUES  ("Engineer", 98000.00, 4),
        ("Researcher", 80000.00, 1),
        ("Analyst", 65000.00, 3),
        ("Tester", 23000.00, 5),
        ("Counselor", 60000.00, 2),
        ("Project Manager", 72000.00, 4),
        ("Intern", 5000.00, 5),
        ("Manager", 100000.00, 6);

INSERT INTO employee(first_name,last_name,role_id,manager_id)
VALUES  ("Stephanie","Urkel",1,7),
        ("Jessica","Night",2,7),
        ("Hal","Ninethousand",3,7),
        ("Thisis","Notajoke",4,6),
        ("Bigol","Bearhug",5,6),
        ("Air","Tabler",6,6),
        ("Yaknow","Whatshisname",7,7);
