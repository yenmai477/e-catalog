import { History } from 'history'
import * as React from 'react'
import {
  Form,
  Button,
  Grid,
  Header,
  Loader,
  Modal,
  ItemGroup,
  Item,
  Icon
} from 'semantic-ui-react'

import { createProduct, deleteProduct, getProducts } from '../api/products-api'
import Auth from '../auth/Auth'
import { Product } from '../types/Product'

interface ProductsProps {
  auth: Auth
  history: History
}

interface ProductsState {
  products: Product[]
  productName: string
  description: string
  price: number
  maker: string
  loadingProducts: boolean
  showModal: boolean
}

export class Products extends React.PureComponent<ProductsProps, ProductsState> {

  noImageUrl: string = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png'

  state: ProductsState = {
    products: [],
    productName: '',
    description: '',
    price: 0,
    maker: '',
    loadingProducts: true,
    showModal: false
  }

  handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ productName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: event.target.value })
  }

  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ price: Number.parseFloat(event.target.value) })
  }

  handleMakerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ maker: event.target.value })
  }

  onEditButtonClick = (productId: string) => {
    this.props.history.push(`/products/${productId}/edit`)
  }

  onProductCreate = async () => {
    try {
      const newProduct = await createProduct(this.props.auth.getIdToken(), {
        productName: this.state.productName,
        description: this.state.description,
        price: this.state.price,
        maker: this.state.maker,
      })
      this.setState({
        products: [...this.state.products, newProduct],
        productName: '',
        description: '',
        price: 0,
        maker: '',
        showModal: false
      })
    } catch (err) {
      console.log(err)
      alert('Product creation failed')
    }
  }

  onProductDelete = async (productId: string) => {
    try {
      await deleteProduct(this.props.auth.getIdToken(), productId)
      this.setState({
        products: this.state.products.filter(product => product.productId !== productId)
      })
    } catch (err) {
      console.log(err)
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const products = await getProducts(this.props.auth.getIdToken())
      this.setState({
        products,
        loadingProducts: false
      })
    } catch (err) {
      console.log(err)
      alert(`Failed to fetch todos: ${(err as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Products</Header>

        <Button
          content="Add product"
          labelPosition='right'
          icon='add'
          onClick={() => this.setState({ showModal: true })}
          positive
        />

        {this.renderCreateProductInput()}

        {this.renderProducts()}
      </div>
    )
  }

  renderCreateProductInput() {
    return (
      <Modal
        open={this.state.showModal}
      >
        <Modal.Header>Add task</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Form>
              <Form.Field>
                <label>Product name</label>
                <input placeholder='Ex: T-Shirt' onChange={this.handleProductNameChange} />
              </Form.Field>
              <Form.Field>
                <label>Description</label>
                <input placeholder='Ex: Red luxury T-shirt,...' onChange={this.handleDescriptionChange} />
              </Form.Field>
              <Form.Field>
                <label>Price ($)</label>
                <input placeholder='Ex: 25' type='number' onChange={this.handlePriceChange} />
              </Form.Field>
              <Form.Field>
                <label>Maker</label>
                <input placeholder='Ex: NemNew' onChange={this.handleMakerChange} />
              </Form.Field>
              <Button type='submit' primary onClick={this.onProductCreate}>Create</Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => this.setState({ showModal: false })}>
            Cancel
          </Button>
          <Button
            type='submit'
            content="Create"
            labelPosition='right'
            icon='add'
            onClick={() => this.onProductCreate()}
            positive
          />
        </Modal.Actions>
      </Modal>
    )
  }

  renderProducts() {
    if (this.state.loadingProducts) {
      return this.renderLoading()
    }

    return this.renderProductsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Products
        </Loader>
      </Grid.Row>
    )
  }

  renderProductsList() {
    return (
      <ItemGroup>
        {this.state.products.map(product => {
          return (
            <Item>
              <Item.Image size='small' src={product.attachmentUrl ? product.attachmentUrl : this.noImageUrl} />
              <Item.Content>
                <Item.Header>{product.productName}</Item.Header>
                <Item.Meta>
                  <span className='price'>${product.price}</span><br />
                  <span className='maker'>{product.maker}</span>
                </Item.Meta>
                <Item.Description>{product.description}</Item.Description>
                <Item.Description>
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(product.productId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                  <Button
                    icon
                    color="red"
                    onClick={() => this.onProductDelete(product.productId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </Item.Description>
              </Item.Content>
            </Item>
          )
        })}
      </ItemGroup>
    )
  }
}
