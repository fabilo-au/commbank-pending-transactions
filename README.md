# CommBank Pending Transaction Exporter

A Chrome extension that extracts transactions (including pending transacitons) from Commbank's NetBank and exports them to QFX format for use with financial software. By default Commbank doesn't allow exporting of pending transactions.

## Features

- Extracts pending transactions from CommBank NetBank
- Exports transactions to QFX format (compatible with Quicken and other financial software)
- Simple one-click export process
- Customizable filename for exports

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing this extension

## Usage

1. Log in to CommBank NetBank
2. Navigate to the Transaction History page
3. Click the extension icon in your Chrome toolbar
4. Click "Export Pending Transactions"
5. Choose a filename (optional) and confirm the download

## File Format

The extension exports transactions in QFX (Quicken Financial Exchange) format, which is compatible with:
- Quicken
- Other financial software that supports QFX/OFX import

## Security

This extension:
- Only runs on the CommBank NetBank website
- Does not store or transmit any data
- Processes all data locally in your browser
- Requires minimal permissions

## Development

The extension is built using:
- Chrome Extension Manifest V3
- Pure JavaScript (no external dependencies)
- Standard Web APIs

## License

MIT License - Feel free to modify and distribute as needed. 