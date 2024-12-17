## Capsule SDK Documentation

### Overview

The Capsule SDK is a comprehensive toolkit designed to interact with the Arweave network, facilitating file and folder management within a decentralized file system. It leverages Arweave's permanent storage capabilities to offer a robust solution for managing drives, folders, and files in a secure and immutable manner.

### Installation

To use the Capsule SDK in your project, you need to install it via npm or yarn. Ensure you have Node.js installed in your environment before proceeding.

```bash
npm install capsule-js
```

or

```bash
yarn add capsule-js
```

### Key Components

The SDK is structured around several key services and models that interact with the Arweave network:

1. **Capsule**: The main entry point for using the SDK. It initializes the necessary services with provided configuration.

2. **Services**:

   - **DriveService**: Manages operations related to drives such as creation, retrieval, and modification.
   - **FolderService**: Handles folder-related operations including creation and listing of folder contents.
   - **FileService**: Provides functionality to manage files, including uploading and downloading.

3. **Models**:

   - **Drive**: Represents a drive entity on the Arweave network.
   - **Folder**: Represents a folder within a drive.
   - **File**: Represents a file within a folder.

4. **Utilities**:
   - **Crypto**: Provides encryption and decryption functionalities for private drives and files.
   - **ArFSApi**: Handles API calls to the Arweave network.

### Usage Example

#### Create a new drive

Below is a simple example demonstrating how to initialize the SDK and create a new drive:

```ts
import { Capsule } from 'capsule-js'

const capsule = new Capsule({ wallet: 'use_wallet', appName: 'arfs-js-drive' })

const drive = await capsule.drive.create('My Drive', { visibility: 'public' })
```

#### Create a new folder

Below is a simple example demonstrating how to initialize the SDK and create a new folder:

```ts
import { Capsule } from 'capsule-js'

const capsule = new Capsule({ wallet: 'use_wallet', appName: 'arfs-js-drive' })

const folder = await capsule.folder.create('My Folder', {
  driveId: '<driveId>',
  parentFolderId: '<parentFolderId>',
  visibility: 'public'
})
```

#### Create a new file

Below is a simple example demonstrating how to initialize the SDK and create a new file:

```ts
import { Capsule } from 'capsule-js'

const capsule = new Capsule({ wallet: 'use_wallet', appName: 'arfs-js-drive' })

const file = await capsule.file.create({
  name: 'My File',
  size: 1024,
  dataContentType: 'text/plain',
  driveId: '<driveId>',
  parentFolderId: '<parentFolderId>',
  file: fileBuffer,
  visibility: 'public'
})
```

### Configuration

The SDK can be configured with the following options:

- **gateway**: URL to the Arweave gateway.
- **wallet**: Path or object representing the Arweave wallet.
- **appName**: Optional. Name of the application using the SDK.

### API Reference

Detailed API documentation is available for all classes and methods provided by the SDK. This includes parameters, return types, and descriptions of each function.

### Contributing

Contributions to the Capsule SDK are welcome. Please refer to the project's GitHub repository to submit issues or pull requests.

### License

The SDK is licensed under the ISC license, allowing for free and open usage in both personal and commercial projects.

This documentation provides a high-level overview and starting points for integrating the Capsule SDK into your projects. For more detailed information, refer to the source code and further documentation in the SDK's repository.
