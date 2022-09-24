import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ProductItem } from '../models/ProductItem'
import { UpdateProductRequest } from '../requests/UpdateProductRequest'
import { genPresignUrl } from '../attachment/attachementHelper'
import * as uuid from 'uuid'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('product-data-access')

export class ProductAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly productsTable = process.env.PRODUCTS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) { }

    getProducts = async (userId: string): Promise<ProductItem[]> => {
        logger.log('info', 'Querying all product...')
        let products: ProductItem[]
        const result = await this.docClient.query({
            TableName: this.productsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        products = result.Items as ProductItem[]
        return products
    }

    createProduct = async (product: ProductItem): Promise<ProductItem> => {
        logger.log('info', 'Create new product: '.concat(JSON.stringify(product)))
        await this.docClient.put({
            TableName: this.productsTable,
            Item: product
        }).promise()
        return product
    }

    updateProduct = async (userId: string, productId: string, updateProduct: UpdateProductRequest): Promise<void> => {
        logger.log('info', 'Updating product info: '.concat(JSON.stringify({ ...updateProduct, userId, productId })))
        await this.docClient.update({
            TableName: this.productsTable,
            Key: {
                "userId": userId,
                "productId": productId
            },
            UpdateExpression: "set productName=:productName, description=:description, price=:price, maker=:maker, address=:address, workingStatus=:workingStatus",
            ExpressionAttributeValues: {
                ":productName": updateProduct.productName,
                ":description": updateProduct.description,
                ":price": updateProduct.price,
                ":maker": updateProduct.maker
            }
        }).promise()
    }

    deleteProduct = async (userId: string, productId: string): Promise<void> => {
        logger.log('info', 'Deleting product: '.concat(productId))
        await this.docClient.delete({
            TableName: this.productsTable,
            Key: {
                "userId": userId,
                "productId": productId
            }
        }).promise()
    }

    getUploadURL = async (userId: string, productId: string): Promise<string> => {
        const imageId = uuid.v4()
        const presignedUrl = await genPresignUrl(imageId)
        this.docClient.update({
            TableName: this.productsTable,
            Key: {
                productId,
                userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
            }
        }, (err, data) => {
            if (err) {
                logger.log('error', 'Error: '.concat(err.message))
                throw new Error(err.message)
            }
            logger.log('info', 'Created: '.concat(JSON.stringify(data)))
        })
        return presignedUrl
    }
}