# ringba-export

Export your Ringba data to CSV and JSON files on your local machine.

## Privacy & Security

This tool is designed with privacy in mind:

- **No telemetry** - We don't collect any usage data or analytics
- **No external services** - Your data is only sent to Ringba's official API to retrieve it
- **Local storage only** - All exported data stays on your machine
- **Open source** - You can audit every line of code

Your API credentials are only used to authenticate with Ringba and are never stored or transmitted anywhere else.

## What Gets Exported

This tool exports the following data from your Ringba account:

| Data Type             | Description                                        |
| --------------------- | -------------------------------------------------- |
| **Publishers**        | All publishers with monthly call statistics        |
| **Buyers**            | All buyers with monthly call statistics            |
| **Ping Trees**        | All ping trees with monthly call statistics        |
| **Ping Tree Targets** | All ping tree targets with monthly call statistics |
| **Targets**           | All targets with monthly call statistics           |

## Output Format

For each data type, you get two files:

- **CSV file** - Easy to open in Excel, Google Sheets, or any spreadsheet app
- **JSON file** - Raw API response for programmatic use or backup

Files are saved to `output/<your-account-id>/` with the naming format:

```
output/
  RA1234567890/
    publishers-RA1234567890-2024-01-15.csv
    publishers-data.json
    buyers-RA1234567890-2024-01-15.csv
    buyers-data.json
    pingtrees-RA1234567890-2024-01-15.csv
    pingTrees-data.json
    pingtreetargets-RA1234567890-2024-01-15.csv
    pingTreeTargets-data.json
    targets-RA1234567890-2024-01-15.csv
    targets-data.json
```

## Requirements

- Node.js 18 or higher

## Installation

### Option 1: Use directly with npx (no install needed)

```bash
npx ringba-export -a YOUR_ACCOUNT_ID -k YOUR_API_KEY
```

### Option 2: Install globally

```bash
npm install -g ringba-export
```

Then run from anywhere:

```bash
ringba-export -a YOUR_ACCOUNT_ID -k YOUR_API_KEY
```

### Option 3: Clone the repository

```bash
git clone https://github.com/ppckid/ringba-export.git
cd ringba-export
npm install
```

Then run with:

```bash
npm run export -- -a YOUR_ACCOUNT_ID -k YOUR_API_KEY
```

## Usage

### Basic Usage

```bash
npx ringba-export -a YOUR_ACCOUNT_ID -k YOUR_API_KEY
```

### Command Line Options

| Option         | Alias | Description                       |
| -------------- | ----- | --------------------------------- |
| `--account-id` | `-a`  | Your Ringba account ID (required) |
| `--api-key`    | `-k`  | Your Ringba API key (required)    |
| `--help`       | `-h`  | Show help message                 |

### Examples

Using long flags:

```bash
npx ringba-export --account-id RA1234567890 --api-key your-api-key-here
```

Using short flags:

```bash
npx ringba-export -a RA1234567890 -k your-api-key-here
```

Show help:

```bash
npx ringba-export --help
```

### Example Output

```
Exporting Ringba data...
Output directory: output/RA1234567890
Found 12 publishers
Exported publishers to output/RA1234567890/publishers-RA1234567890-2024-01-15.csv
Found 8 buyers
Exported buyers to output/RA1234567890/buyers-RA1234567890-2024-01-15.csv
Found 5 pingtrees
Exported pingtrees to output/RA1234567890/pingtrees-RA1234567890-2024-01-15.csv
Found 15 pingtreetargets
Exported pingtreetargets to output/RA1234567890/pingtreetargets-RA1234567890-2024-01-15.csv
Found 20 targets
Exported targets to output/RA1234567890/targets-RA1234567890-2024-01-15.csv
Export complete!
```

## Finding Your Ringba Credentials

### Account ID

1. Log into your Ringba dashboard
2. Your Account ID is under the user icon in the top right.
3. It starts with `RA` followed by numbers

### API Key

1. Log into your Ringba dashboard
2. Go to **Settings** > **API**
3. Copy your API key (or generate a new one if needed)

## Building from Source

If you want to build the TypeScript to JavaScript:

```bash
npm run build
```

This creates the `dist/` folder with compiled JavaScript.

## License

MIT
