// modulos externos
import inquirer from 'inquirer';
import chalk from 'chalk';

// modulos internos
import fs from 'fs';

operation();

function operation() {

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você quer fazer?',
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }]).then((answer) => {
        const action = answer['action'];

        if (action === 'Criar conta') {createAccount()}
        else if (action === 'Consultar saldo') {consultBalance()}
        else if (action === 'Depositar') {deposit()}
        else if (action === 'Sacar') {drawBalance()} 
        else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'));
            process.exit();
        }
    })
    .catch((err) => {
        console.log(err);
    })
}

// criar conta 
function createAccount() {
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'));
    console.log(chalk.green('Defina as opções a seguir:'));

    buildAccount();
}

// depositar saldo na conta do usuário 
function deposit() {
    
    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite o nome da conta ao qual você quer depositar:'
    }]).then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccountName(accountName)) {
            return deposit();
        }
        
        inquirer.prompt([{
            name: 'amount',
            message: 'Digite o valor que você deseja depositar: '
        }]).then((answer) => {
            const amount = answer['amount'];

            addAmount(accountName, amount);
            return operation();
        })
        .catch((err) => {
            console.log(err);
        })

    })
    .catch((err) => {
        console.log(err);
    })

}

// consultar saldo na conta do usuário
function consultBalance() {
    inquirer.prompt([{
        name: "accountName",
        message: "Digite o nome da conta:"
    }]).then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccountName(accountName)) {
            return consultBalance()
        }

        const account = getAccount(accountName);
        console.log(chalk.bgGreen.black("Saldo atual da conta: R$", account.balance));

        return operation()
    })
    .catch(err => {
        console.log(err);
    })
}

// sacar saldo na conta do usuário
function drawBalance() {
    inquirer.prompt([{
        name: "accountName",
        message: "Digite o nome da conta ao qual você desejar sacar:"
    }]).then((answer) => {
        const accountName = answer['accountName'];

        if (!checkAccountName(accountName)) {
            console.log(chalk.bgRed.black('Esta conta não existe! Digite uma conta válida.'));
            return drawBalance()
        }

        inquirer.prompt([{
            name: "amount",
            message: "Digite o valor que você deseja sacar: "
        }]).then((answer) => {
            const account = getAccount(accountName);
            const amount = answer['amount'];

            const currBalance = parseFloat(account.balance);
            
            if (parseFloat(amount) > currBalance) {
                console.log(chalk.bgRed.black('Saldo insuficiente!'));
                return drawBalance()
            }

            decreaseBalance(accountName, amount);
            return operation()
        })
        .catch((err) => {
            console.log(err);
        })
    })
    .catch((err) => {
        console.log(err);
    })
}

function buildAccount() {

    inquirer.prompt([{
        name: 'accountName',
        message: 'Digite um nome para sua conta:'
        }]).then((answer) => {
            const accountName = answer['accountName'];
    
            console.info(accountName);
    
            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts');
            }
            
            if (checkAccountName(accountName)) {
                console.log(chalk.bgRed.black('Está conta já existe. Escolha outro nome!'));
                return buildAccount()
            }
    
            fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => {
                console.log(err);
            })
    
            console.log(chalk.green('Parabens! Sua conta foi criada com sucesso!'));
            operation();
        })
        .catch((err) => {
            console.log(err);
        })
}

function checkAccountName(accountName) {
    if (fs.existsSync(`accounts/${accountName}.json`)) {
        return true
    }

    console.log(chalk.bgRed.black('Esta conta não existe! Digite uma conta válida.'));
    return false
}

function addAmount(accountName, amount) {

    const account = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro! Tente novamente mais tarde.'));
        return deposit()
    }

    account.balance = parseFloat(amount) + parseFloat(account.balance);
    fs.writeFileSync(`accounts/${accountName}.json`, 
    JSON.stringify(account), (err) => {
        console.log(err);
    });

    console.log(chalk.bgGreen.black(`Foi depositado o valor de R$${amount} na conta ${accountName}!`));
    return
}

function decreaseBalance(accountName, amount) {
    const account = getAccount(accountName);

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro! Tente novamente mais tarde.'));
        return drawBalance()
    }

    account.balance = parseFloat(account.balance) - parseFloat(amount);
    fs.writeFileSync(`accounts/${accountName}.json`, 
    JSON.stringify(account), (err) => {
        console.log(err);
    })

    console.log(chalk.bgGreen.black(`Foi retirado o valor de R$${amount} na conta ${accountName}!`));
    return 
}

function getAccount(accountName) {
    const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJson);
}