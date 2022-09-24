import { ProductAccess } from '../dataAccess/productAccess'
import { ProductItem } from '../models/ProductItem'
import { CreateProductRequest } from '../requests/CreateProductRequest'
import { UpdateProductRequest } from '../requests/UpdateProductRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

const logger = createLogger('product-bussiness-layer')
const productAccess = new ProductAccess()

export const getProducts = async (userId: string): Promise<ProductItem[]> => {
    return await productAccess.getProducts(userId);
}

export const createProduct = async (userId: string, product: CreateProductRequest): Promise<ProductItem> => {
    logger.log('info', 'Received product create request: '.concat(JSON.stringify(product)))
    const productId = uuid.v4();
    const newProduct: ProductItem = {
        ...product,
        userId,
        productId,
        createdAt: new Date().toISOString()
    }
    await productAccess.createProduct(newProduct);
    return newProduct;
}

export const updateProduct = async (userId: string, productId: string, updateProduct: UpdateProductRequest): Promise<void> => {
    logger.log('info', 'Received product update request: '.concat(productId))
    await productAccess.updateProduct(userId, productId, updateProduct)
}

export const deleteProduct = async (userId: string, productId: string): Promise<void> => {
    logger.log('info', 'Received product delete request: '.concat(productId))
    await productAccess.deleteProduct(userId, productId)
}

export const generateUploadURL = async (userId: string, productId: string): Promise<string> => {
    logger.log('info', 'Uploading image for product: '.concat(productId))
    const url = await productAccess.getUploadURL(userId, productId)
    return url 
}