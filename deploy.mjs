import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ethers } from 'ethers';
import solc from 'solc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTRACT_PATH = 'contracts/SubscribeNFT.sol';
const CONTRACT_SOURCE = fs.readFileSync(CONTRACT_PATH, 'utf8');

// Load env from .env.deploy file
const envFile = fs.readFileSync('.env.deploy', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length) env[key.trim()] = values.join('=').trim();
});

const {
  RPC_URL,
  PRIVATE_KEY,
  NAME,
  SYMBOL,
  PRICE_WEI,
  TREASURY,
  BASE_TOKEN_URI,
  MAX_SUPPLY
} = env;

if (!RPC_URL || !PRIVATE_KEY) { console.error('Missing RPC_URL or PRIVATE_KEY'); process.exit(1); }
if (!TREASURY || !ethers.isAddress(TREASURY)) { console.error('TREASURY invalid'); process.exit(1); }

const input = {
  language: 'Solidity',
  sources: { [CONTRACT_PATH]: { content: CONTRACT_SOURCE } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi','evm.bytecode.object'] } }
  }
};

function findImport(importPath){
  try{
    const candidates=[
      path.resolve(importPath),
      path.resolve(__dirname,'node_modules',importPath),
      path.resolve(__dirname,'node_modules','@openzeppelin',importPath),
    ];
    for(const p of candidates){
      if(fs.existsSync(p)) return { contents: fs.readFileSync(p,'utf8') };
    }
    return { error: 'File not found: '+importPath };
  }catch(e){ return { error: e.message }; }
}

function compile(){
  const out = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
  if (out.errors){
    const hard = out.errors.filter(e=>e.severity==='error');
    if (hard.length){ console.error(hard.map(e=>e.formattedMessage).join('\n')); process.exit(1); }
    else { console.warn(out.errors.map(e=>e.formattedMessage).join('\n')); }
  }
  const c = out.contracts[CONTRACT_PATH]['SubscribeNFT'];
  return { abi: c.abi, bytecode: '0x'+c.evm.bytecode.object };
}

async function main(){
  console.log('Compiling SubscribeNFT…');
  const { abi, bytecode } = compile();
  fs.mkdirSync(path.join(__dirname,'artifacts'),{recursive:true});
  fs.writeFileSync(path.join(__dirname,'artifacts','SubscribeNFT.abi.json'), JSON.stringify(abi,null,2));

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  const args = [
    NAME || 'DJZS Subscribe',
    SYMBOL || 'DJZSUB',
    BigInt(PRICE_WEI || '1000000000000000'),
    TREASURY,
    BASE_TOKEN_URI || '',
    BigInt(MAX_SUPPLY || '0')
  ];

  console.log('Deployer:', await wallet.getAddress());
  console.log('Network:', await provider.getNetwork());
  console.log('Deploying with args:', args);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(...args);
  console.log('Tx hash:', contract.deploymentTransaction().hash);
  const deployed = await contract.waitForDeployment();
  const address = await deployed.getAddress();

  console.log('✅ Deployed at:', address);
  console.log('\nSet Replit secrets:');
  console.log('VITE_SUBSCRIBE_NFT_ADDRESS =', address);
  console.log('VITE_SUBSCRIBE_PRICE =', (Number(PRICE_WEI || '1000000000000000')/1e18).toString());
}

main().catch((e)=>{ console.error(e); process.exit(1); });
