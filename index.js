/** Requirements **/
const inquirer = require('inquirer');
const mysql = require('mysql2');
require("dotenv").config();


/** SETUP SQL AND PORT **/
const PORT = process.env.PORT || 3001;

const db = mysql.createConnection(
    {
      host: 'localhost',
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS
    },
    console.log(`Connected to the ${process.env.DB_NAME} database.`)
);


/** VIEW FUNCTIONS **/
const viewAllDepts = () => {

    db.query(`SELECT name AS "Department", id AS "ID" FROM department`, 
    (err,data) =>{
        if(err){
            console.log(err);
            db.end;
        }
        else{
            console.table(data);
            main();
        }
    })
}

const viewAllRoles = () => {

    db.query(`SELECT
                role.id AS "ID",
                title AS "Job Title",
                name AS "Department",
                CONCAT( '$', FORMAT(salary, 'C') ) AS "Salary"
            FROM role
            JOIN department
                ON (department.id = role.department_id)
            ORDER BY role.id`, (err,data) =>{
        if(err){
            console.log(err);
            db.end;
        }
        else{
            console.table(data);
            main();
        }
    })
}

const viewAllStaff = () => {

    db.query(`SELECT
                staff.id AS "ID",
                CONCAT( first_name, ' ', last_name) AS "Employee Name",
                role.title AS "Job Title",
                department.name AS "Department",
                CONCAT( '$', FORMAT(salary, 'C') ) AS "Salary",
                (SELECT CONCAT( first_name, ' ', last_name)
                    FROM employee AS manager
                WHERE manager.id = staff.manager_id) AS Manager
            FROM employee AS staff
            JOIN role
                ON (staff.role_id = role.id)
            JOIN department
                ON (department.id = role.department_id)
            ORDER BY staff.id`, (err,data) =>{
        if(err){
            console.log(err);
            db.end;
        }
        else{
            console.table(data);
            main();
        }
    })
}


/** ADD FUNCTIONS **/
const addDept = () => {
    inquirer.prompt ({
        type : "input",
        name: "dept_name",
        message: "What is the name of the new department?"
    })
    .then(
        ({ dept_name }) => {
            if(dept_name){
                db.query(`INSERT INTO department (name)
                        VALUES ('${dept_name}')`,
                (err,data) =>{
                    if(err){
                        console.log(err);
                        db.end;
                    }
                    else{
                        console.log(`New department created!`);
                        main();
                    }
                }) // END Query
            }
            else{
                console.log("Please fill in all required fields.");
                main();
            }
            
        }
    ); // END .then
}

const addRole = () => {
    // Getting a list of Departments first...
    db.query(`SELECT name FROM department`,
        (err,depts) => {
            if(err){
                console.log(err);
                db.end;
            }
            else{
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'role_name',
                        message: 'What is the role?'
                    },
                    {
                        type: 'input',
                        name: 'role_salary',
                        message: 'What is the starting salary? (Decimal format please)'
                    },
                    {
                        type: 'list',
                        name: 'role_dept',
                        message: 'Which department is this role in?',
                        choices: depts
                    }
                ])
                .then(
                    ({role_name, role_salary, role_dept}) => {

                        if(role_name && role_salary && role_dept){
                            db.query(`INSERT INTO role (title, salary, department_id)
                                    VALUES (
                                        '${role_name}',
                                        ${role_salary},
                                        (SELECT id FROM department WHERE name = '${role_dept}')
                                    )`,
                            (err,data) =>{
                                if(err){
                                    console.log(err);
                                    db.end;
                                }
                                else{
                                    console.log(`New role created!`);
                                    main();
                                }
                            }) // END Query
                        }
                        else{
                            console.log("Please fill in all required fields.");
                            main();
                        }
                    }
                )
            }
        }
    );

}

const addEmployee = () => {

    db.query(`SELECT title AS name FROM role`,
        (err,roles) => {
            if(err){
                console.log(err);
                db.end;
            }
            else{
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'employee_first_name',
                        message: 'Employee FIRST name:'
                    },
                    {
                        type: 'input',
                        name: 'employee_last_name',
                        message: 'Employee LAST name:'
                    },
                    {
                        type: 'list',
                        name: 'employee_role',
                        message: "What is the employee's role?",
                        choices: roles
                    },
                    {
                        type: 'input',
                        name: 'employee_manager',
                        message: "What is their manager's ID?"
                    }
                ])
                .then(
                    ({employee_first_name, employee_last_name, employee_role, employee_manager}) => {

                        if(employee_first_name && employee_last_name && employee_role && employee_manager){
                            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (
                                        '${employee_first_name}',
                                        '${employee_last_name}',
                                        (SELECT id FROM role WHERE title = '${employee_role}'),
                                        ${employee_manager}
                                    )`,
                            (err,data) =>{
                                if(err){
                                    console.log(err);
                                    db.end;
                                }
                                else{
                                    console.log(`New employee added!`);
                                    main();
                                }
                            }); // END Query - insert employee
                        }
                        else{
                            console.log("Please fill in all required fields.");
                            main();
                        }
                    }
                ) // END .then
            }
        }
    ); // END Query - roles
}


/** UPDATE FUNCTIONS **/
const checkEmployees = () => {
    db.query(`SELECT CONCAT(id, '. ', first_name, ' ', last_name) AS name FROM employee`,
        (err,employees) => {
            if(err){
                console.log(err);
                db.end;
            }
            else{
                inquirer.prompt({
                    type: 'list',
                    name: 'employee_name',
                    message: 'Which employee would you like to update?',
                    choices: employees
                })
                .then(
                    ({employee_name}) => {
                        const employeeID = employee_name.split(".")[0];
                        updateEmployee( employeeID );
                    }
                )
            }
        }
    ); // END Query
}

const updateEmployee = (employeeID) => {
    db.query(`SELECT title AS name FROM role`,
        (err,roles) => {
            if(err){
                console.log(err);
                db.end;
            }
            else{
                inquirer.prompt({
                    type: 'list',
                    name: 'new_role',
                    message: "What is the employee's new role?",
                    choices: roles
                })
                .then(
                    ({new_role}) => {
                        db.query(`UPDATE employee
                                SET role_id = 
                                    (SELECT DISTINCT id FROM role WHERE title = '${new_role}')
                                WHERE id = ${employeeID}`,
                            (err,data) =>{
                                if(err){
                                    console.log(err);
                                    db.end;
                                }
                                else{
                                    console.log(`Role updated!`);
                                    main();
                                }
                            }
                        ); // END Query
                    }
                )
            }
        }
    ); // END Query
}


/** MAIN MENU START **/
const main = () => {
    inquirer.prompt({
        type:"list",
        name:"main_menu",
        message:"Select an option:",
        choices:[
            "View all departments",
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Quit"
        ]
    })
    .then(
        ({ main_menu }) => {
            console.log(`User has chosen to ${main_menu}`); //DEBUG
            switch(main_menu){
                case "View all departments" :
                    viewAllDepts();
                    break;
                case "View all roles" :
                    viewAllRoles();
                    break;
                case "View all employees" :
                    viewAllStaff();
                    break;
                case "Add a department" :
                    addDept();
                    break;
                case "Add a role" :
                    addRole();
                    break;
                case "Add an employee" :
                    addEmployee();
                    break;
                case "Update an employee role" :
                    checkEmployees();
                    break;
                default:
                    console.log("Bye!");
                    db.end();
                    break;
            } // END switch
        } // END Main Menu selection
    ); // END .then
}; // END main
main();