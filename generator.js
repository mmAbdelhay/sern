const readline = require('readline');
const {exec} = require('child_process');
const fs = require('fs').promises; // Using promisified fs
const util = require('util');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin, output: process.stdout
});

const COLORS = {
    RED: '\x1b[31m', GREEN: '\x1b[32m', NC: '\x1b[0m' // No Color
};

const TEMPLATE_DIRS = {
    templates: 'templates',
    repositories: 'repositories',
    controllers: 'controllers',
    routes: 'routes',
    swagger: 'swagger',
    middlewares: 'middlewares'
};

const getTemplatePath = (templateName) => path.join(__dirname, `${TEMPLATE_DIRS.templates}/${templateName}`);

// Function to replace placeholders in a file
async function replacePlaceholdersInFile(filePath, replacements) {
    try {
        let data = await fs.readFile(filePath, 'utf8');
        for (const key in replacements) {
            data = data.replace(new RegExp(`\\[${key}\\]`, 'g'), replacements[key]);
        }
        await fs.writeFile(filePath, data, 'utf8');
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC}`);
    }
}

// Function to generate a file from a template and copy it to a destination
async function generateFileFromTemplate(templateName, destinationDir, fileName, replacements = {}) {
    try {
        await fs.mkdir(destinationDir, {recursive: true});
        const templateFile = getTemplatePath(templateName);
        const destinationFile = path.join(destinationDir, fileName);
        await fs.copyFile(templateFile, destinationFile);
        await replacePlaceholdersInFile(destinationFile, replacements);
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC}`);
    }
}

const questionAsync = util.promisify(rl.question).bind(rl);

async function generateModel(modelName) {
    if (!modelName) {
        modelName = await questionAsync('Enter the model name: ');
    }

    const attributes = await questionAsync('Attributes as Sequelize (e.g., title:string,name:string): ');

    const command = `npx sequelize-cli model:generate --name ${modelName} --attributes ${attributes}`;

    try {
        const {stdout} = await util.promisify(exec)(command);
        console.log(`${COLORS.GREEN}${stdout}${COLORS.NC}`);
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC}`);
    }
}

async function generateRepository(modelName) {
    if (!modelName) {
        modelName = await questionAsync('Enter the model name: ');
    }

    const destinationDir = path.join(TEMPLATE_DIRS.repositories, `${modelName}Repository.js`);

    try {
        await fs.copyFile(getTemplatePath('repositoryTemplate'), destinationDir);
        await replacePlaceholdersInFile(destinationDir, {model_name: modelName});
        console.log('Repository created');
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in generateRepository`);
    }
}

async function generateController(modelName) {
    if (!modelName) {
        modelName = await questionAsync('Enter the model name: ');
    }

    const destinationDir = path.join(TEMPLATE_DIRS.controllers, modelName);
    await fs.mkdir(destinationDir, {recursive: true});

    try {
        await generateFileFromTemplate('controllerTemplate', destinationDir, `${modelName}Controller.js`, {model_name: modelName})
        await generateFileFromTemplate('RulesTemplate', destinationDir, `create${modelName}Rules.js`, {
            model_name: modelName,
            method_name: 'create'
        })
        await generateFileFromTemplate('RulesTemplate', destinationDir, `update${modelName}Rules.js`, {
            model_name: modelName,
            method_name: 'update'
        })

        console.log('Controller created with its rules files');
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in generateController`);
    }
}

async function generateRoutes(modelName, modelNameForRoutes) {
    if (!modelName)
        modelName = await questionAsync('Enter the model name: ');

    if (!modelNameForRoutes)
        modelNameForRoutes = await questionAsync('Enter route name: ');

    const destinationDir = path.join(TEMPLATE_DIRS.routes, `${modelName}Routes.js`);

    try {
        await fs.copyFile(getTemplatePath('RoutesTemplate'), destinationDir);
        await replacePlaceholdersInFile(destinationDir, {
            model_name: modelName,
            model_name_for_routes: modelNameForRoutes
        });
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in generateRoutes`);
    }
}

async function generateSwagger(modelName, modelNameForRoutes) {
    if (!modelName) {
        modelName = await questionAsync('Enter the model name: ');
    }

    const destinationDir = path.join(TEMPLATE_DIRS.swagger, `${modelName}.yaml`);

    try {
        await fs.copyFile(getTemplatePath('swaggerTemplate'), destinationDir);
        await replacePlaceholdersInFile(destinationDir, {
            model_name: modelName,
            model_name_for_routes: modelNameForRoutes
        });
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in generateSwagger`);
    }
}

async function generateMiddlewares(modelName) {
    if (!modelName) {
        modelName = await questionAsync('Enter the model name: ');
    }

    const destinationDir = path.join(TEMPLATE_DIRS.middlewares, modelName);

    try {
        await fs.mkdir(destinationDir, {recursive: true});

        await generateFileFromTemplate('existenceMiddlewareTemplate', destinationDir, `${modelName}ExistenceMiddleware.js`, {model_name: modelName});
        await generateFileFromTemplate('validationMiddlewareTemplate', destinationDir, `${modelName}ValidationMiddleware.js`, {model_name: modelName})

        console.log('Middlewares created');
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in generateMiddleware`);
    }
}

async function migrate() {
    try {
        const {stdout} = await util.promisify(exec)('npx sequelize-cli db:migrate');
        console.log(`${COLORS.GREEN}${stdout}${COLORS.NC}`);
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in migrate`);
    }
}

async function undoMigrate() {
    try {
        const {stdout} = await util.promisify(exec)('npx sequelize-cli db:migrate:undo');
        console.log(`${COLORS.GREEN}${stdout}${COLORS.NC}`);
    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC} in migrate`);
    }
}

async function generateCrud() {
    const modelName = await questionAsync('Enter the model name: ');

    console.log(`Your model name is "${modelName}"`)

    await generateModel(modelName)
    await generateRepository(modelName)
    await generateController(modelName)

    const modelNameForRoutes = await questionAsync('Enter route name: ');

    await generateRoutes(modelName, modelNameForRoutes)
    await generateSwagger(modelName, modelNameForRoutes)
    await generateMiddlewares(modelName)
    await migrate(modelName)

    console.log(`${COLORS.GREEN} Crud generated successfully ${COLORS.NC}`)

}

async function undoCrud() {
    let modelName = await questionAsync('Enter the model name: ');

    const repositoriesDir = path.join(TEMPLATE_DIRS.repositories, `${modelName}Repository.js`);
    const controllersDir = path.join(TEMPLATE_DIRS.controllers, modelName);
    const routesDir = path.join(TEMPLATE_DIRS.routes, `${modelName}Routes.js`);
    const swaggerDir = path.join(TEMPLATE_DIRS.swagger, `${modelName}.yaml`);
    const middlewaresDir = path.join(TEMPLATE_DIRS.middlewares, modelName);

    try {
        await undoMigrate();

        // Remove repository file
        await fs.unlink(repositoriesDir);

        // Remove controller directory and its contents
        await fs.rm(controllersDir, {recursive: true});

        // Remove routes file
        await fs.unlink(routesDir);

        // Remove Swagger file
        await fs.unlink(swaggerDir);

        // Remove middlewares directory and its contents
        await fs.rm(middlewaresDir, {recursive: true});

        console.log('Undo completed.');

    } catch (error) {
        console.error(`${COLORS.RED}Error: ${error.message}${COLORS.NC}`);
    }
}

async function mainMenu() {
    const choice = await questionAsync('What do you think of ?! :: ');

    switch (choice) {
        case '1':
            await generateCrud();
            displayMenu();
            break;
        case '2':
            await generateController();
            displayMenu();
            break;
        case '3':
            await generateRepository();
            displayMenu();
            break;
        case '4':
            await undoCrud();
            displayMenu();
            break;
        case '5':
            console.log('Bye (･_･)');
            rl.close();
            break;
        default:
            console.log('Invalid option');
            break;
    }
}

function displayMenu() {
    const mainMenuOptions = ['Generate CRUD', 'Generate Controller', 'Generate Repository', 'undo CRUD', 'Quit'];

    mainMenuOptions.forEach((option, index) => {
        console.log(`${index + 1}. ${option}`);
    });

    mainMenu();
}

displayMenu();