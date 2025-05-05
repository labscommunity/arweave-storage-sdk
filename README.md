# Arweave Storage SDK

The **Arweave Storage SDK** is a comprehensive toolkit designed to easily store any type of data permanently, facilitating seamless file and folder management on the Arweave blockchain. It leverages Arweave's decentralized permanent storage capabilities and ArFS specification to offer a robust solution for managing drives, folders, and files in a secure and immutable manner. With built-in encryption support, Arweave Storage SDK allows you to store files privately ensuring only authorized parties can access the content.

For seamless data storage and retrieval on [Arweave](https://www.arweave.org/), use the [`Arweave Storage SDK`](https://www.npmjs.com/package/arweave-storage-sdk).

---

## Documentation

The SDK is structured around several key services and models that produce Arweave compatible transactions:

- **Drives** – Create, list, and manage Arweave Storage SDK’s drives.  
    
- **Folders** – Organize files in a hierarchical folder system.  
    
- **Files** – Create, download, and manage file data.  
    
- **Query** – Get uploaded file links, search for files using tags.

---

## Requirements

- **Node 18 or higher.**

The library makes use of modern JavaScript/TypeScript features that require at least Node 18\.

---

## Installation

Install the package with:

```

npm install arweave-storage-sdk

# or

yarn add arweave-storage-sdk

```

*This simple installation command adds Arweave Storage SDK to your project. It’s designed to integrate quickly, whether you’re building a prototype or a production-level application.*  
---

## Usage

Below is a quick example of how to initialize the Arweave Storage SDK,create a drive, a folder, and a file, or quickly upload a file. For more detailed use-cases, refer to the [Examples](https://github.com) section.

### Basic Setup

To use the SDK, initialize StorageApi with a configuration object. This will create a new Arweave Storage SDK client. You may also specify the application name (`appName`) and optional configurations.

```javascript
const { Configuration, StorageApi, Token, Network } = require('arweave-storage-sdk');

const config = new Configuration({
	appName: '<Name of your App>'
	privateKey: '<ENV to private key or use_web_wallet>',
	network: Network.BASE_MAINNET,
	token: Token.USDC
})

const storageClient = new StorageApi(config);
await storageApiInstance.ready

```

### Authentication

Once you have the storage client initialized and before you go ahead to upload any files, its really important to create a secured session by authenticating yourself. This allows you to track or query your uploads, receipts. It is easy and can be done in one line.

```javascript
  //Login
  await storageApiInstance.api.login()
```

And that's it. You’re ready to make authenticated requests with the service.

### Upload cost estimates

Assuming you have a valid session post login, the next step is to query for file upload prices. This is an optional step, in-case you are interested in setting up uploads conditionally or to check your wallet for enough balance before your upload. Based on your selected token and network, estimates will be provided to you in the same token and also in USD. 

```javascript
export interface GetEstimatesResponse {
  size: number
  usd: number
  usdc: {
    amount: string
    amountInSubUnits: string
  }
  payAddress: string
}
const size = file.size // 200000 bytes
const estimates = await storageClient.getEstimates(size) // size of type number

console.log(estimates)
{ 
  "data": { 
"size": 200000, 
"usd": 0.008599242237052303, 
"usdc": { 
"amount": "0.0086", 
"amountInSubUnits": "8600" 
}, 
"payAddress": "<USDC ADDRESS OF THE SERVICE>" 
  } 
}
```

### Quick file upload

Upload a file (or buffer) quickly using the quickUpload method.

The `quickUpload` method simplifies the process of uploading a file to Arweave. It automatically handles the creation of the transaction, including setting metadata such as content type, visibility, and tags. The receipt returned includes the unique ID, to query and confirm the file upload.

```javascript

const file = <web File object, file path, buffer or stream>const receipt = await storageClient.quickUpload(file, {
	name: file.name || "test.txt",
	dataContentType: 'text/plain', // content type of the file
	visibility: '<public|private>',
	tags: [{name: "Collection-Type", value: "ART"}],	size: file.size // size in bytes of type number
});

console.log('File has been uploaded. receipt:', receipt.id);

```

### 

### Creating a Drive

Create a new drive to manage your files on Arweave.

Drives act as containers for your files and folders. The additional parameters such as visibility and tags help you categorize and control access to your content. This context is useful if you’re new to managing storage on decentralized platforms.

```javascript

const drive = await storageClient.drive.create('My Drive', { 
visibility: 'public',
tags: [{name: "Collection-Type", value: "ART"}] 
});

console.log('Drive created with ID:', drive.id);

```

### 

### Creating a Folder

Organize your files by creating folders within a drive.

Folders help you structure your files within a drive. In this example, you can see how to specify the parent drive and (optionally) a parent folder to build a hierarchical file system. 

```javascript

const folder = await storageClient.folder.create('My Folder', {
driveId: '<driveId>',
parentFolderId: '<parentFolderId>',
visibility: 'public',
tags: [{name: "Collection-Type", value: "ART"}]
});

console.log('Folder created with ID:', folder.id);

```

### Creating a File

Store a file on Arweave by creating a file transaction.

This snippet creates a file by converting a string into a buffer and then sending it as a transaction to Arweave. The parameters include metadata like file name, size, and content type.

```javascript

const fileData = Buffer.from('Hello, Arweave!');

const file = await storageClient.file.create({
	name: 'My File',
	size: fileData.length,
	dataContentType: 'text/plain',
	driveId: '<driveId>',
	parentFolderId: '<parentFolderId>',
	file: fileData,
	visibility: 'public',
	tags: [{name: "Collection-Type", value: "ART"}]
});

console.log('File uploaded; transaction ID:', file.txId);

```

**Note**: The `visibility` field can be set to `public` or `private`.

---

## Wallet

Arweave Storage SDK’s WalletService is designed to help you interact with your stored files and manage your funds. Whether you need to fetch a list of files or check your wallet balance, this service simplifies those tasks. Here’s what you can do with this WalletService:

* **Get all Files:** Retrieve all uploaded file links.  
* **SearchFile:** Search for files using tags.  
* **Balances:** Read wallet balances.

---

## Configuration

Initialize the **Arweave Storage SDK** object with various configuration options.  The `appName` is recommended as it helps in organizing and searching your transactions on Arweave. The `privateKey` can either be your account’s key or a flag to use a browser wallet. Other parameters like `network`, `token`, and `gateway` let you tailor the SDK to your specific environment.

```javascript

const { Configuration, Network, Token} = require('arweave-storage-sdk');

const config = new Configuration({
	appName: 'My cool project'
	privateKey: process.env.PRIVATE_KEY,
	network: Network.BASE_MAINNET,
	token: Token.USDC
})
```

| Option | Optional | Description |
| :---- | :---- | :---- |
| `appName` | true | App name to be used in Arweave transactions. Recommended to use since it makes searching all your app files easier. |
| `privateKey` | false | Private key of your account. JWK in case of Arweave. if `'use_web_wallet'` is used, sdk will rely on browser wallets. |
| `network` | true | Network of your payment token. Eg: 'SOL\_MAINNET'. Simply use the Network object provided by the sdk to see supported networks. Defaults to Arweave. |
| `token` | true | Token to use for payments. Eg: 'USDT'. Use the Token object provided by the sdk to see all supported tokens. Defaults to AR. |

## 

## 

## **Other Configuration Notes**

* **Encryption:** For private drives or file storage, use the built-in Crypto utilities to manage encryption.  
* **API Calls:** The SDK uses the ArFSApi internally to interact with the Arweave network. You can override or customize gateway endpoints if needed.
* **Terms of Service and Privacy Policy:** The link to the Terms of Service and Privacy Policy for the Arweave Data Storage SDK [Tos and Privacy Policy](https://github.com/labscommunity/arweave-storage-sdk/blob/main/Arweave%20Data%20Storage%20SDK%20-%20ToS%20and%20Privacy%20Policy.pdf)


  
---
