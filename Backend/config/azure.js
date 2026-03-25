/**
 * Azure Blob Storage Configuration
 * Handles video upload, storage, and SAS URL generation
 * Per Backend_Plan Phase 1.4: Azure Blob Storage configuration
 */

const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const config = require('./environment');
const logger = require('../utils/logger');

class AzureBlobStorageManager {
  constructor() {
    this.blobServiceClient = null;
    this.containerClient = null;
    this.initialize();
  }

  /**
   * Initialize Azure Blob Storage Service Client
   */
  initialize() {
    try {
      logger.info('Initializing Azure Blob Storage...');

      // Create BlobServiceClient from connection string
      this.blobServiceClient = BlobServiceClient.fromConnectionString(
        config.azure.connectionString
      );

      logger.info(`Azure Blob Storage initialized for account: ${config.azure.accountName}`);
    } catch (error) {
      logger.error(`Azure Blob Storage initialization error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get container client
   * Creates container if it doesn't exist
   */
  async getContainerClient() {
    try {
      if (!this.containerClient) {
        this.containerClient = this.blobServiceClient.getContainerClient(
          config.azure.containerName
        );

        // Try to create container (will not error if it already exists)
        await this.containerClient.createIfNotExists({
          access: 'container',
        });

        logger.info(`Container '${config.azure.containerName}' ready`);
      }

      return this.containerClient;
    } catch (error) {
      logger.error(`Failed to get container client: ${error.message}`);
      throw error;
    }
  }

  /**
   * Upload blob to Azure
   * @param {string} blobName - Name of the blob (e.g., video-123.mp4)
   * @param {Buffer} fileBuffer - File content as buffer
   * @param {string} contentType - MIME type
   * @returns {Promise<string>} - Blob URL
   */
  async uploadBlob(blobName, fileBuffer, contentType = 'video/mp4') {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      logger.info(`Uploading blob: ${blobName}`);

      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      logger.info(`Blob uploaded successfully: ${blobName}`);

      return blockBlobClient.url;
    } catch (error) {
      logger.error(`Blob upload error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate SAS URL for secure blob access
   * @param {string} blobName - Name of the blob
   * @param {number} expiryMinutes - URL expiry in minutes (default: 15)
   * @returns {string} - SAS URL with signature
   */
  async generateSASUrl(blobName, expiryMinutes = null) {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Default to config value if not provided
      const expiry = expiryMinutes || config.azure.sasUrlExpiryMinutes;

      // Create SAS permissions (read-only for video streaming)
      const blobSAS = generateBlobSASQueryParameters(
        {
          containerName: config.azure.containerName,
          blobName,
          permissions: BlobSASPermissions.parse('r'), // Read-only
          startsOn: new Date(),
          expiresOn: new Date(new Date().valueOf() + expiry * 60 * 1000),
        },
        this.blobServiceClient.credential // Use connection string credentials
      );

      const sasUrl = `${blockBlobClient.url}?${blobSAS}`;

      logger.info(`SAS URL generated for ${blobName}, expires in ${expiry} minutes`);

      return sasUrl;
    } catch (error) {
      logger.error(`SAS URL generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete blob from Azure
   * @param {string} blobName - Name of the blob
   */
  async deleteBlob(blobName) {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      logger.info(`Deleting blob: ${blobName}`);

      await blockBlobClient.delete();

      logger.info(`Blob deleted successfully: ${blobName}`);
    } catch (error) {
      logger.error(`Blob deletion error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if blob exists
   * @param {string} blobName - Name of the blob
   * @returns {Promise<boolean>}
   */
  async blobExists(blobName) {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      return await blockBlobClient.exists();
    } catch (error) {
      logger.error(`Blob existence check error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get blob properties
   * @param {string} blobName - Name of the blob
   * @returns {Promise<object>} - Blob properties
   */
  async getBlobProperties(blobName) {
    try {
      const containerClient = await this.getContainerClient();
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      const properties = await blockBlobClient.getProperties();

      return {
        contentLength: properties.contentLength,
        contentType: properties.contentType,
        createdOn: properties.createdOn,
        lastModified: properties.lastModified,
      };
    } catch (error) {
      logger.error(`Failed to get blob properties: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all blobs in container (pagination support)
   * @returns {Promise<array>} - Array of blob names
   */
  async listBlobs() {
    try {
      const containerClient = await this.getContainerClient();
      const blobs = [];

      for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob.name);
      }

      return blobs;
    } catch (error) {
      logger.error(`Failed to list blobs: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new AzureBlobStorageManager();
