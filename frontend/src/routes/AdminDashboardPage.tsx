import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { adminApi, type CreateProductPayload, type CreateVariantPayload, type UpdateProductPayload, type UpdateVariantPayload } from '../api/adminApi'
import {
  ProductFormModal,
  VariantFormModal,
  type AdminProductFormMode,
  type AdminProductFormValues,
  type AdminVariantFormMode,
  type AdminVariantFormValues,
} from '../components/admin/AdminCatalogForms'
import {
  AdminActionButton,
  AdminMetricGrid,
  AdminPageHeader,
  AdminSectionPanel,
  AdminShell,
  AdminStatusBadge,
  AdminTable,
  type AdminSection,
  type AdminTableColumn,
  type AdminTableRow,
} from '../components/admin/AdminScaffold'
import { toApiError } from '../lib/api'
import type {
  ApiError,
  CustomerStatus,
  OrderDetail,
  OrderListItem,
  OrderStatus,
  ProductListItem,
  ProductVariant,
  User,
} from '../types/api'

type AdminSectionId =
  | 'overview'
  | 'products'
  | 'variants'
  | 'orders'
  | 'cancellations'
  | 'customers'

type AdminProductVariant = ProductVariant & {
  productId: string
  productName: string
}

type AdminDashboardData = {
  customers: User[]
  customersTotal: number
  orders: OrderListItem[]
  ordersTotal: number
  products: ProductListItem[]
  productsTotal: number
  variants: AdminProductVariant[]
}

type AdminMetric = {
  detail: string
  label: string
  value: string
}

type StatusTone = 'active' | 'danger' | 'neutral' | 'warning'

const adminPageLimit = 20

const adminSections: Array<AdminSection & { id: AdminSectionId }> = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Workspace summary',
  },
  {
    id: 'products',
    label: 'Products',
    description: 'Catalog records',
  },
  {
    id: 'variants',
    label: 'Variants & Stock',
    description: 'Size, color, inventory',
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Status and payment',
  },
  {
    id: 'cancellations',
    label: 'Cancellation Review',
    description: 'Customer requests',
  },
  {
    id: 'customers',
    label: 'Customers',
    description: 'Accounts and status',
  },
]

const productColumns: AdminTableColumn[] = [
  { key: 'product', label: 'Product' },
  { key: 'type', label: 'Type' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'status', label: 'Status' },
]

const variantColumns: AdminTableColumn[] = [
  { key: 'product', label: 'Product' },
  { key: 'size', label: 'Size' },
  { key: 'color', label: 'Color' },
  { key: 'stock', label: 'Stock', align: 'right' },
  { key: 'status', label: 'Status' },
]

const orderColumns: AdminTableColumn[] = [
  { key: 'order', label: 'Order' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
  { key: 'payment', label: 'Payment' },
  { key: 'total', label: 'Total', align: 'right' },
]

const cancellationColumns: AdminTableColumn[] = [
  { key: 'order', label: 'Order' },
  { key: 'contact', label: 'Contact' },
  { key: 'reason', label: 'Reason' },
  { key: 'status', label: 'Status' },
]

const customerColumns: AdminTableColumn[] = [
  { key: 'customer', label: 'Customer' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
]

const customerStatusOptions: CustomerStatus[] = [
  'ACTIVE',
  'BLOCKED',
  'INACTIVE',
]

const orderStatusFlow: Record<OrderStatus, OrderStatus | null> = {
  CANCELLED: null,
  CONFIRMED: 'PROCESSING',
  DELIVERED: null,
  PENDING: 'CONFIRMED',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
}

const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  style: 'currency',
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function AdminDashboardPage() {
  const [activeSectionId, setActiveSectionId] =
    useState<AdminSectionId>('overview')
  const [customers, setCustomers] = useState<User[]>([])
  const [customersTotal, setCustomersTotal] = useState(0)
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [ordersTotal, setOrdersTotal] = useState(0)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [productsTotal, setProductsTotal] = useState(0)
  const [variants, setVariants] = useState<AdminProductVariant[]>([])
  const [productFormMode, setProductFormMode] =
    useState<AdminProductFormMode | null>(null)
  const [variantFormMode, setVariantFormMode] =
    useState<AdminVariantFormMode | null>(null)
  const [variantProductFilterId, setVariantProductFilterId] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null)
  const [loadError, setLoadError] = useState<ApiError | null>(null)
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const [actionMessage, setActionMessage] = useState('')
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const activeSection = adminSections.find(
    (section) => section.id === activeSectionId,
  )

  const commitDashboardData = useCallback((snapshot: AdminDashboardData) => {
    setCustomers(snapshot.customers)
    setCustomersTotal(snapshot.customersTotal)
    setOrders(snapshot.orders)
    setOrdersTotal(snapshot.ordersTotal)
    setProducts(snapshot.products)
    setProductsTotal(snapshot.productsTotal)
    setVariants(snapshot.variants)
  }, [])

  const commitOrderDetail = useCallback((order: OrderDetail) => {
    setOrders((currentOrders) =>
      currentOrders.map((currentOrder) =>
        currentOrder.id === order.id
          ? {
              ...currentOrder,
              cancellationRequest: order.cancellationRequest,
              paymentOption: order.paymentOption,
              paymentStatus: order.paymentStatus,
              status: order.status,
              total: order.total,
            }
          : currentOrder,
      ),
    )
    setSelectedOrder(order)
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialDashboardData() {
      try {
        const snapshot = await fetchAdminDashboardData()

        if (isMounted) {
          commitDashboardData(snapshot)
          setLoadError(null)
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(normalizeApiError(error))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadInitialDashboardData()

    return () => {
      isMounted = false
    }
  }, [commitDashboardData])

  async function reloadDashboardData() {
    const snapshot = await fetchAdminDashboardData()
    commitDashboardData(snapshot)
    setLoadError(null)
  }

  async function handleReload() {
    setIsLoading(true)
    setLoadError(null)
    setActionError(null)
    setActionMessage('')

    try {
      await reloadDashboardData()
    } catch (error) {
      setLoadError(normalizeApiError(error))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleViewCustomer(customerId: string) {
    setPendingActionId(`customer-detail-${customerId}`)
    setActionError(null)
    setActionMessage('')

    try {
      const customer = await adminApi.getCustomer(customerId)
      setSelectedCustomer(customer)
      setActionMessage(`Loaded ${customer.fullName}.`)
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleCustomerStatusChange(
    customerId: string,
    status: CustomerStatus,
  ) {
    setPendingActionId(`customer-status-${customerId}-${status}`)
    setActionError(null)
    setActionMessage('')

    try {
      const customer = await adminApi.updateCustomerStatus(customerId, {
        status,
      })

      setCustomers((currentCustomers) =>
        currentCustomers.map((currentCustomer) =>
          currentCustomer.id === customer.id ? customer : currentCustomer,
        ),
      )
      setSelectedCustomer((currentCustomer) =>
        currentCustomer?.id === customer.id ? customer : currentCustomer,
      )
      setActionMessage(
        `${customer.fullName} is now ${formatCustomerStatus(customer.status)}.`,
      )
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleViewOrder(orderId: string) {
    setPendingActionId(`order-detail-${orderId}`)
    setActionError(null)
    setActionMessage('')

    try {
      const order = await adminApi.getOrder(orderId)
      commitOrderDetail(order)
      setActionMessage(`Loaded ${formatOrderId(order.id)}.`)
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleOrderStatusChange(
    orderId: string,
    status: OrderStatus,
  ) {
    setPendingActionId(`order-status-${orderId}-${status}`)
    setActionError(null)
    setActionMessage('')

    try {
      const order = await adminApi.updateOrderStatus(orderId, { status })
      commitOrderDetail(order)
      setActionMessage(
        `${formatOrderId(order.id)} moved to ${formatOrderStatus(order.status)}.`,
      )
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleCancelOrder(orderId: string, suggestedNote?: string) {
    const adminNote = window.prompt(
      'Admin cancellation note',
      suggestedNote ?? 'Cancelled from admin dashboard.',
    )

    if (adminNote === null) {
      return
    }

    setPendingActionId(`order-cancel-${orderId}`)
    setActionError(null)
    setActionMessage('')

    try {
      const order = await adminApi.cancelOrder(orderId, {
        adminNote: adminNote.trim() || 'Cancelled from admin dashboard.',
      })
      commitOrderDetail(order)
      setActionMessage(`${formatOrderId(order.id)} has been cancelled.`)
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  function handleOpenAddProduct() {
    setActionError(null)
    setActionMessage('')
    setProductFormMode({ kind: 'create' })
  }

  async function handleOpenEditProduct(productId: string) {
    setPendingActionId(`product-edit-${productId}`)
    setActionError(null)
    setActionMessage('')

    try {
      const product = await adminApi.getProduct(productId)
      setProductFormMode({ kind: 'edit', product })
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleProductFormSubmit(values: AdminProductFormValues) {
    if (!productFormMode) {
      const error: ApiError = { message: 'Product form is not ready.' }
      throw error
    }

    setActionError(null)
    setActionMessage('')
    setPendingActionId(
      productFormMode.kind === 'edit'
        ? `product-submit-${productFormMode.product.id}`
        : 'product-submit-new',
    )

    try {
      if (productFormMode.kind === 'create') {
        const payload: CreateProductPayload = {
          description: values.description,
          images: values.images,
          material: values.material,
          name: values.name,
          price: values.price,
          type: values.type,
        }
        const product = await adminApi.createProduct(payload)

        setProductFormMode(null)
        await reloadDashboardData()
        setActionMessage(`${product.name} has been created.`)
        return
      }

      const payload: UpdateProductPayload = {
        description: values.description,
        isActive: values.isActive,
        material: values.material,
        name: values.name,
        price: values.price,
        type: values.type,
        ...(values.imagesChanged ? { images: values.images } : {}),
      }
      const product = await adminApi.updateProduct(
        productFormMode.product.id,
        payload,
      )

      setProductFormMode(null)
      await reloadDashboardData()
      setActionMessage(`${product.name} has been updated.`)
    } catch (error) {
      const apiError = normalizeApiError(error)
      setActionError(apiError)
      throw apiError
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleToggleProduct(product: ProductListItem) {
    const nextIsActive = !product.isActive
    setPendingActionId(`product-toggle-${product.id}`)
    setActionError(null)
    setActionMessage('')

    try {
      const updatedProduct = await adminApi.updateProduct(product.id, {
        isActive: nextIsActive,
      })
      await reloadDashboardData()
      setActionMessage(
        `${updatedProduct.name} is now ${
          updatedProduct.isActive ? 'active' : 'paused'
        }.`,
      )
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleSoftDeleteProduct(product: ProductListItem) {
    const shouldDelete = window.confirm(
      `Soft delete ${product.name}? It will disappear from the default admin and customer product lists.`,
    )

    if (!shouldDelete) {
      return
    }

    setPendingActionId(`product-delete-${product.id}`)
    setActionError(null)
    setActionMessage('')

    try {
      await adminApi.deleteProduct(product.id)
      await reloadDashboardData()
      setActionMessage(`${product.name} has been soft deleted.`)
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  function handleManageProductVariants(product: ProductListItem) {
    setVariantProductFilterId(product.id)
    setActiveSectionId('variants')
    setActionError(null)
    setActionMessage(`Showing variants for ${product.name}.`)
  }

  function handleOpenAddVariant(productId?: string) {
    if (!products.length) {
      setActionError({ message: 'Create a product before adding variants.' })
      return
    }

    setActionError(null)
    setActionMessage('')
    setVariantFormMode({
      kind: 'create',
      productId: productId || variantProductFilterId || products[0].id,
    })
  }

  function handleOpenEditVariant(variant: AdminProductVariant) {
    setActionError(null)
    setActionMessage('')
    setVariantFormMode({
      kind: 'edit',
      productId: variant.productId,
      productName: variant.productName,
      variant,
    })
  }

  async function handleVariantFormSubmit(values: AdminVariantFormValues) {
    if (!variantFormMode) {
      const error: ApiError = { message: 'Variant form is not ready.' }
      throw error
    }

    setActionError(null)
    setActionMessage('')
    setPendingActionId(
      variantFormMode.kind === 'edit'
        ? `variant-submit-${variantFormMode.variant.id}`
        : 'variant-submit-new',
    )

    try {
      if (variantFormMode.kind === 'create') {
        const payload: CreateVariantPayload = {
          color: values.color,
          size: values.size,
          stock: values.stock,
          ...(values.images.length ? { images: values.images } : {}),
        }
        await adminApi.createVariant(values.productId, payload)

        setVariantFormMode(null)
        setVariantProductFilterId(values.productId)
        await reloadDashboardData()
        setActionMessage('Variant has been created.')
        return
      }

      const payload: UpdateVariantPayload = {
        color: values.color,
        isActive: values.isActive,
        size: values.size,
        stock: values.stock,
        ...(values.imagesChanged ? { images: values.images } : {}),
      }
      await adminApi.updateVariant(variantFormMode.variant.id, payload)

      setVariantFormMode(null)
      await reloadDashboardData()
      setActionMessage('Variant has been updated.')
    } catch (error) {
      const apiError = normalizeApiError(error)
      setActionError(apiError)
      throw apiError
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleToggleVariant(variant: AdminProductVariant) {
    const nextIsActive = !variant.isActive
    setPendingActionId(`variant-toggle-${variant.id}`)
    setActionError(null)
    setActionMessage('')

    try {
      await adminApi.updateVariant(variant.id, {
        isActive: nextIsActive,
      })
      await reloadDashboardData()
      setActionMessage(
        `${variant.productName} ${variant.size} ${variant.color} is now ${
          nextIsActive ? 'active' : 'inactive'
        }.`,
      )
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  async function handleSoftDeleteVariant(variant: AdminProductVariant) {
    const shouldDelete = window.confirm(
      `Soft delete ${variant.productName} ${variant.size} ${variant.color}?`,
    )

    if (!shouldDelete) {
      return
    }

    setPendingActionId(`variant-delete-${variant.id}`)
    setActionError(null)
    setActionMessage('')

    try {
      await adminApi.deleteVariant(variant.id)
      await reloadDashboardData()
      setActionMessage('Variant has been soft deleted.')
    } catch (error) {
      setActionError(normalizeApiError(error))
    } finally {
      setPendingActionId(null)
    }
  }

  const overviewMetrics = createOverviewMetrics({
    customersTotal,
    ordersTotal,
    productsTotal,
    variantsLoaded: variants.length,
  })
  const visibleVariants = variantProductFilterId
    ? variants.filter((variant) => variant.productId === variantProductFilterId)
    : variants

  const productRows = products.map((product) => ({
    id: product.id,
    cells: {
      price: formatProductPrice(product.price),
      product: (
        <AdminPrimaryCell
          title={product.name}
          detail={`${product.material} / ${product.availableSizes.length} sizes / ${product.availableColors.length} colors`}
        />
      ),
      status: (
        <AdminStatusBadge
          label={product.isActive ? 'Active' : 'Paused'}
          tone={product.isActive ? 'active' : 'neutral'}
        />
      ),
      type: formatProductType(product.type),
    },
    actions: (
      <AdminActionGroup>
        <AdminActionButton
          disabled={pendingActionId === `product-edit-${product.id}`}
          onClick={() => void handleOpenEditProduct(product.id)}
        >
          Edit
        </AdminActionButton>
        <AdminActionButton
          disabled={pendingActionId === `product-toggle-${product.id}`}
          onClick={() => void handleToggleProduct(product)}
        >
          {product.isActive ? 'Pause' : 'Activate'}
        </AdminActionButton>
        <AdminActionButton
          disabled={false}
          onClick={() => handleManageProductVariants(product)}
        >
          Variants
        </AdminActionButton>
        <AdminActionButton
          disabled={pendingActionId === `product-delete-${product.id}`}
          onClick={() => void handleSoftDeleteProduct(product)}
        >
          Delete
        </AdminActionButton>
      </AdminActionGroup>
    ),
  }))

  const variantRows = visibleVariants.map((variant) => ({
    id: variant.id,
    cells: {
      color: variant.color,
      product: (
        <AdminPrimaryCell title={variant.productName} detail="Variant stock" />
      ),
      size: variant.size,
      status: (
        <AdminStatusBadge
          label={getVariantStatusLabel(variant)}
          tone={getVariantStatusTone(variant)}
        />
      ),
      stock: variant.stock.toLocaleString('en-US'),
    },
    actions: (
      <AdminActionGroup>
        <AdminActionButton
          disabled={false}
          onClick={() => handleOpenEditVariant(variant)}
        >
          Edit
        </AdminActionButton>
        <AdminActionButton
          disabled={pendingActionId === `variant-toggle-${variant.id}`}
          onClick={() => void handleToggleVariant(variant)}
        >
          {variant.isActive ? 'Pause' : 'Activate'}
        </AdminActionButton>
        <AdminActionButton
          disabled={pendingActionId === `variant-delete-${variant.id}`}
          onClick={() => void handleSoftDeleteVariant(variant)}
        >
          Delete
        </AdminActionButton>
      </AdminActionGroup>
    ),
  }))

  const orderRows = orders.map((order) => (
    {
      id: order.id,
      cells: {
        contact:
          selectedOrder?.id === order.id ? (
            <AdminPrimaryCell
              title={selectedOrder.shippingName}
              detail={selectedOrder.phone}
            />
          ) : (
            'Open detail'
          ),
        order: (
          <AdminPrimaryCell
            title={formatOrderId(order.id)}
            detail={formatOrderDate(order.createdAt)}
          />
        ),
        payment: `${order.paymentOption} / ${order.paymentStatus}`,
        status: (
          <AdminStatusBadge
            label={formatOrderStatus(order.status)}
            tone={getOrderStatusTone(order.status)}
          />
        ),
        total: formatProductPrice(order.total),
      },
      actions: (
        <OrderActions
          order={order}
          pendingActionId={pendingActionId}
          onCancelOrder={handleCancelOrder}
          onStatusChange={handleOrderStatusChange}
          onViewOrder={handleViewOrder}
        />
      ),
    }
  ))

  const cancellationRows = orders
    .filter((order) => order.cancellationRequest)
    .map((order) => ({
      id: order.cancellationRequest?.id ?? order.id,
      cells: {
        contact:
          selectedOrder?.id === order.id ? (
            <AdminPrimaryCell
              title={selectedOrder.shippingName}
              detail={selectedOrder.phone}
            />
          ) : (
            'Open detail'
          ),
        order: (
          <AdminPrimaryCell
            title={formatOrderId(order.id)}
            detail={formatOrderStatus(order.status)}
          />
        ),
        reason: order.cancellationRequest?.reason ?? 'No reason provided',
        status: (
          <AdminStatusBadge
            label={
              order.cancellationRequest?.resolvedAt ? 'Resolved' : 'Open'
            }
            tone={order.cancellationRequest?.resolvedAt ? 'neutral' : 'warning'}
          />
        ),
      },
      actions: (
        <CancellationActions
          order={order}
          pendingActionId={pendingActionId}
          onCancelOrder={handleCancelOrder}
          onViewOrder={handleViewOrder}
        />
      ),
    }))

  const customerRows = customers.map((customer) => ({
    id: customer.id,
    cells: {
      customer: <AdminPrimaryCell title={customer.fullName} detail="Customer" />,
      email: customer.email,
      phone: customer.phoneNumber,
      status: (
        <AdminStatusBadge
          label={formatCustomerStatus(customer.status)}
          tone={getCustomerStatusTone(customer.status)}
        />
      ),
    },
    actions: (
      <CustomerActions
        customer={customer}
        pendingActionId={pendingActionId}
        onStatusChange={handleCustomerStatusChange}
        onViewCustomer={handleViewCustomer}
      />
    ),
  }))

  return (
    <AdminShell
      activeSectionId={activeSectionId}
      sections={adminSections}
      onSectionChange={(sectionId) =>
        setActiveSectionId(sectionId as AdminSectionId)
      }
    >
      <AdminPageHeader
        title="Admin Dashboard"
        description="Manage the KNG catalog, stock, customer orders, cancellation requests, and account status from a single operational workspace."
        actions={
          <>
            <AdminBackLink />
            {activeSectionId === 'products' ? (
              <AdminActionButton
                disabled={false}
                variant="primary"
                onClick={handleOpenAddProduct}
              >
                Add Product
              </AdminActionButton>
            ) : null}
          </>
        }
      />

      <AdminActionFeedback error={actionError} message={actionMessage} />

      <div className="mt-8 space-y-5">
        {isLoading ? (
          <AdminLoadingState />
        ) : loadError ? (
          <AdminErrorState error={loadError} onRetry={handleReload} />
        ) : (
          <>
            {activeSectionId === 'overview' ? (
              <OverviewPanels
                cancellationRows={cancellationRows}
                metrics={overviewMetrics}
                orderRows={orderRows}
                productRows={productRows}
              />
            ) : null}
            {activeSectionId === 'products' ? (
              <ProductsPanel productRows={productRows} />
            ) : null}
            {activeSectionId === 'variants' ? (
              <VariantsPanel
                products={products}
                selectedProductId={variantProductFilterId}
                variantRows={variantRows}
                onAddVariant={handleOpenAddVariant}
                onProductFilterChange={setVariantProductFilterId}
              />
            ) : null}
            {activeSectionId === 'orders' ? (
              <OrdersPanel
                orderRows={orderRows}
                pendingActionId={pendingActionId}
                selectedOrder={selectedOrder}
                onCancelOrder={handleCancelOrder}
                onStatusChange={handleOrderStatusChange}
              />
            ) : null}
            {activeSectionId === 'cancellations' ? (
              <CancellationsPanel
                cancellationRows={cancellationRows}
                pendingActionId={pendingActionId}
                selectedOrder={selectedOrder}
                onCancelOrder={handleCancelOrder}
                onStatusChange={handleOrderStatusChange}
              />
            ) : null}
            {activeSectionId === 'customers' ? (
              <CustomersPanel
                customerRows={customerRows}
                selectedCustomer={selectedCustomer}
              />
            ) : null}
          </>
        )}
      </div>

      {activeSection ? (
        <p className="sr-only" aria-live="polite">
          Showing {activeSection.label}
        </p>
      ) : null}

      {productFormMode ? (
        <ProductFormModal
          key={
            productFormMode.kind === 'edit'
              ? `edit-${productFormMode.product.id}`
              : 'create-product'
          }
          mode={productFormMode}
          onClose={() => setProductFormMode(null)}
          onSubmit={handleProductFormSubmit}
        />
      ) : null}

      {variantFormMode ? (
        <VariantFormModal
          key={
            variantFormMode.kind === 'edit'
              ? `edit-${variantFormMode.variant.id}`
              : `create-variant-${variantFormMode.productId ?? 'none'}`
          }
          mode={variantFormMode}
          products={products}
          onClose={() => setVariantFormMode(null)}
          onSubmit={handleVariantFormSubmit}
        />
      ) : null}
    </AdminShell>
  )
}

async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const [customersData, ordersData, productsData] = await Promise.all([
    adminApi.listCustomers({ limit: adminPageLimit, page: 1 }),
    adminApi.listOrders({ limit: adminPageLimit, page: 1 }),
    adminApi.listProducts({ limit: adminPageLimit, page: 1 }),
  ])

  const variantGroups = await Promise.all(
    productsData.items.map(async (product) => {
      const productVariants = await adminApi.listVariants(product.id)

      return productVariants.map((variant) => ({
        ...variant,
        productId: product.id,
        productName: product.name,
      }))
    }),
  )

  return {
    customers: customersData.items,
    customersTotal: customersData.total,
    orders: ordersData.items,
    ordersTotal: ordersData.total,
    products: productsData.items,
    productsTotal: productsData.total,
    variants: variantGroups.flat(),
  }
}

function AdminBackLink() {
  return (
    <Link
      to="/profile"
      className="inline-flex h-10 items-center justify-center whitespace-nowrap border border-[#111111] bg-transparent px-4 text-xs font-bold uppercase tracking-[0.16em] text-[#111111] transition hover:bg-[#111111] hover:text-white"
    >
      Back To Profile
    </Link>
  )
}

function AdminActionFeedback({
  error,
  message,
}: {
  error: ApiError | null
  message: string
}) {
  if (!error && !message) {
    return null
  }

  return (
    <div
      className={`mt-5 border px-4 py-3 text-sm font-semibold leading-6 ${
        error
          ? 'border-[#7a2e2e] bg-[#7a2e2e]/5 text-[#7a2e2e]'
          : 'border-[#111111] bg-[#111111]/5 text-[#111111]'
      }`}
      role={error ? 'alert' : 'status'}
    >
      {error ? error.message : message}
    </div>
  )
}

function AdminLoadingState() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse border border-[#d3d3d3] bg-[#111111]/10"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse border border-[#d3d3d3] bg-[#111111]/10" />
    </div>
  )
}

function AdminErrorState({
  error,
  onRetry,
}: {
  error: ApiError
  onRetry: () => void
}) {
  return (
    <AdminSectionPanel
      eyebrow="Admin Data"
      title="Unable To Load Dashboard"
      description="The dashboard uses admin-only endpoints and requires an active admin session."
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold leading-6 text-[#7a2e2e]">
          {error.message}
        </p>
        <AdminActionButton disabled={false} onClick={onRetry}>
          Retry
        </AdminActionButton>
      </div>
    </AdminSectionPanel>
  )
}

function OverviewPanels({
  cancellationRows,
  metrics,
  orderRows,
  productRows,
}: {
  cancellationRows: AdminTableRow[]
  metrics: AdminMetric[]
  orderRows: AdminTableRow[]
  productRows: AdminTableRow[]
}) {
  return (
    <>
      <AdminMetricGrid metrics={metrics} />
      <div className="grid gap-5 xl:grid-cols-2">
        <AdminSectionPanel
          eyebrow="Catalog"
          title="Product Queue"
          description="Live catalog records, pricing, material, and active status."
        >
          <AdminTable
            columns={productColumns}
            rows={productRows.slice(0, 3)}
            emptyLabel="No products found"
          />
        </AdminSectionPanel>
        <AdminSectionPanel
          eyebrow="Orders"
          title="Review Queue"
          description="Open cancellation requests first, otherwise recent orders."
        >
          <AdminTable
            columns={cancellationRows.length ? cancellationColumns : orderColumns}
            rows={
              cancellationRows.length
                ? cancellationRows.slice(0, 3)
                : orderRows.slice(0, 3)
            }
            emptyLabel="No orders ready"
          />
        </AdminSectionPanel>
      </div>
    </>
  )
}

function ProductsPanel({ productRows }: { productRows: AdminTableRow[] }) {
  return (
    <AdminSectionPanel
      eyebrow="Catalog"
      title="Products"
      description="Catalog data is live. Add, edit, pause, and soft delete products from this table."
    >
      <AdminTable
        columns={productColumns}
        rows={productRows}
        emptyLabel="No products found"
      />
    </AdminSectionPanel>
  )
}

function VariantsPanel({
  products,
  selectedProductId,
  variantRows,
  onAddVariant,
  onProductFilterChange,
}: {
  products: ProductListItem[]
  selectedProductId: string
  variantRows: AdminTableRow[]
  onAddVariant: (productId?: string) => void
  onProductFilterChange: (productId: string) => void
}) {
  return (
    <AdminSectionPanel
      eyebrow="Inventory"
      title="Variants & Stock"
      description="Manage size and color combinations, active status, stock, and optional variant images."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block sm:min-w-72">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
            Product Filter
          </span>
          <select
            className="mt-2 h-10 w-full border border-[#d3d3d3] bg-white px-3 text-sm font-semibold text-[#111111] outline-none transition focus:border-[#111111]"
            value={selectedProductId}
            onChange={(event) => onProductFilterChange(event.currentTarget.value)}
          >
            <option value="">All Products</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <AdminActionButton
          disabled={products.length === 0}
          variant="primary"
          onClick={() => onAddVariant(selectedProductId || undefined)}
        >
          Add Variant
        </AdminActionButton>
      </div>
      <AdminTable
        columns={variantColumns}
        rows={variantRows}
        emptyLabel="No variants found"
      />
    </AdminSectionPanel>
  )
}

function OrdersPanel({
  orderRows,
  pendingActionId,
  selectedOrder,
  onCancelOrder,
  onStatusChange,
}: {
  orderRows: AdminTableRow[]
  pendingActionId: string | null
  selectedOrder: OrderDetail | null
  onCancelOrder: (orderId: string, suggestedNote?: string) => Promise<void>
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>
}) {
  return (
    <AdminSectionPanel
      eyebrow="Fulfillment"
      title="Orders"
      description="Review order detail, payment state, totals, and move fulfillment status forward."
    >
      <AdminTable
        columns={orderColumns}
        rows={orderRows}
        emptyLabel="No orders found"
      />
      {selectedOrder ? (
        <OrderDetailPanel
          order={selectedOrder}
          pendingActionId={pendingActionId}
          onCancelOrder={onCancelOrder}
          onStatusChange={onStatusChange}
        />
      ) : null}
    </AdminSectionPanel>
  )
}

function CancellationsPanel({
  cancellationRows,
  pendingActionId,
  selectedOrder,
  onCancelOrder,
  onStatusChange,
}: {
  cancellationRows: AdminTableRow[]
  pendingActionId: string | null
  selectedOrder: OrderDetail | null
  onCancelOrder: (orderId: string, suggestedNote?: string) => Promise<void>
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>
}) {
  return (
    <AdminSectionPanel
      eyebrow="Review"
      title="Cancellation Review"
      description="Customer cancellation reasons and admin resolution status."
    >
      <AdminTable
        columns={cancellationColumns}
        rows={cancellationRows}
        emptyLabel="No cancellation requests"
      />
      {selectedOrder ? (
        <OrderDetailPanel
          order={selectedOrder}
          pendingActionId={pendingActionId}
          onCancelOrder={onCancelOrder}
          onStatusChange={onStatusChange}
        />
      ) : null}
    </AdminSectionPanel>
  )
}

function CustomersPanel({
  customerRows,
  selectedCustomer,
}: {
  customerRows: AdminTableRow[]
  selectedCustomer: User | null
}) {
  return (
    <AdminSectionPanel
      eyebrow="Accounts"
      title="Customers"
      description="Customer contact details and account status. Blocked or inactive customers cannot log in or place orders."
    >
      <AdminTable
        columns={customerColumns}
        rows={customerRows}
        emptyLabel="No customers found"
      />
      {selectedCustomer ? (
        <CustomerDetailPanel customer={selectedCustomer} />
      ) : null}
    </AdminSectionPanel>
  )
}

function OrderDetailPanel({
  order,
  pendingActionId,
  onCancelOrder,
  onStatusChange,
}: {
  order: OrderDetail
  pendingActionId: string | null
  onCancelOrder: (orderId: string, suggestedNote?: string) => Promise<void>
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>
}) {
  const nextStatus = getNextOrderStatus(order.status)

  return (
    <section className="mt-5 border border-[#d3d3d3] bg-[#e7e7e3]/70 p-4 sm:p-5">
      <div className="flex flex-col gap-4 border-b border-[#d3d3d3] pb-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
            Order Detail
          </p>
          <h3 className="mt-2 text-xl font-black uppercase tracking-normal">
            {formatOrderId(order.id)}
          </h3>
        </div>
        <AdminActionGroup>
          {nextStatus ? (
            <AdminActionButton
              disabled={
                pendingActionId === `order-status-${order.id}-${nextStatus}`
              }
              onClick={() => void onStatusChange(order.id, nextStatus)}
            >
              Mark {formatOrderStatus(nextStatus)}
            </AdminActionButton>
          ) : null}
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
            <AdminActionButton
              disabled={pendingActionId === `order-cancel-${order.id}`}
              onClick={() =>
                void onCancelOrder(
                  order.id,
                  order.cancellationRequest?.reason ?? undefined,
                )
              }
            >
              Cancel Order
            </AdminActionButton>
          ) : null}
        </AdminActionGroup>
      </div>

      <dl className="mt-5 grid gap-4 border-b border-[#d3d3d3] pb-5 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem label="Ship To" value={order.shippingName} />
        <DetailItem label="Phone" value={order.phone} />
        <DetailItem label="City" value={order.city} />
        <DetailItem label="Payment" value={`${order.paymentOption} / ${order.paymentStatus}`} />
        <DetailItem label="Address" value={order.address} />
        <DetailItem label="Note" value={order.note || 'No note'} />
        <DetailItem label="Status" value={formatOrderStatus(order.status)} />
        <DetailItem label="Total" value={formatProductPrice(order.total)} />
      </dl>

      <div className="mt-5 space-y-3">
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
          Items
        </p>
        {order.items.length ? (
          order.items.map((item) => (
            <div
              key={`${item.variantId}-${item.productName}`}
              className="grid gap-2 border border-[#d3d3d3] bg-[#f4f4f1]/80 px-3 py-3 text-sm font-semibold leading-6 sm:grid-cols-[minmax(0,1fr)_120px_120px]"
            >
              <div>
                <p className="font-bold">{item.productName}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#777777]">
                  {item.size} / {item.color} / Qty {item.quantity}
                </p>
              </div>
              <p>{formatProductPrice(item.unitPrice)}</p>
              <p className="sm:text-right">
                {formatProductPrice(item.subtotal)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm font-semibold text-[#555555]">
            No order items returned.
          </p>
        )}
      </div>

      {order.cancellationRequest ? (
        <div className="mt-5 border border-[#d3d3d3] bg-[#f4f4f1]/80 p-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
            Cancellation Request
          </p>
          <p className="mt-3 text-sm font-semibold leading-6">
            {order.cancellationRequest.reason}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#555555]">
            {order.cancellationRequest.resolvedAt
              ? `Resolved ${formatOrderDate(order.cancellationRequest.resolvedAt)}`
              : 'Open'}
          </p>
          {order.cancellationRequest.adminNote ? (
            <p className="mt-3 text-sm font-semibold leading-6 text-[#555555]">
              Admin note: {order.cancellationRequest.adminNote}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function CustomerDetailPanel({ customer }: { customer: User }) {
  return (
    <section className="mt-5 border border-[#d3d3d3] bg-[#e7e7e3]/70 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
            Customer Detail
          </p>
          <h3 className="mt-2 text-xl font-black uppercase tracking-normal">
            {customer.fullName}
          </h3>
        </div>
        <AdminStatusBadge
          label={formatCustomerStatus(customer.status)}
          tone={getCustomerStatusTone(customer.status)}
        />
      </div>
      <dl className="mt-5 grid gap-4 border-t border-[#d3d3d3] pt-5 sm:grid-cols-2">
        <DetailItem label="Email" value={customer.email} />
        <DetailItem label="Phone" value={customer.phoneNumber} />
        <DetailItem label="Role" value={customer.role} />
        <DetailItem label="Status" value={formatCustomerStatus(customer.status)} />
      </dl>
    </section>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-[#111111]">
        {value}
      </dd>
    </div>
  )
}

function CustomerActions({
  customer,
  pendingActionId,
  onStatusChange,
  onViewCustomer,
}: {
  customer: User
  pendingActionId: string | null
  onStatusChange: (
    customerId: string,
    status: CustomerStatus,
  ) => Promise<void>
  onViewCustomer: (customerId: string) => Promise<void>
}) {
  return (
    <AdminActionGroup>
      <AdminActionButton
        disabled={pendingActionId === `customer-detail-${customer.id}`}
        onClick={() => void onViewCustomer(customer.id)}
      >
        View
      </AdminActionButton>
      {customerStatusOptions.map((status) => (
        <AdminActionButton
          key={status}
          disabled={
            customer.status === status ||
            pendingActionId === `customer-status-${customer.id}-${status}`
          }
          onClick={() => void onStatusChange(customer.id, status)}
        >
          {formatCustomerStatus(status)}
        </AdminActionButton>
      ))}
    </AdminActionGroup>
  )
}

function OrderActions({
  order,
  pendingActionId,
  onCancelOrder,
  onStatusChange,
  onViewOrder,
}: {
  order: OrderListItem
  pendingActionId: string | null
  onCancelOrder: (orderId: string, suggestedNote?: string) => Promise<void>
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>
  onViewOrder: (orderId: string) => Promise<void>
}) {
  const nextStatus = getNextOrderStatus(order.status)

  return (
    <AdminActionGroup>
      <AdminActionButton
        disabled={pendingActionId === `order-detail-${order.id}`}
        onClick={() => void onViewOrder(order.id)}
      >
        View
      </AdminActionButton>
      {nextStatus ? (
        <AdminActionButton
          disabled={pendingActionId === `order-status-${order.id}-${nextStatus}`}
          onClick={() => void onStatusChange(order.id, nextStatus)}
        >
          Mark {formatOrderStatus(nextStatus)}
        </AdminActionButton>
      ) : null}
      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
        <AdminActionButton
          disabled={pendingActionId === `order-cancel-${order.id}`}
          onClick={() =>
            void onCancelOrder(
              order.id,
              order.cancellationRequest?.reason ?? undefined,
            )
          }
        >
          Cancel
        </AdminActionButton>
      ) : null}
    </AdminActionGroup>
  )
}

function CancellationActions({
  order,
  pendingActionId,
  onCancelOrder,
  onViewOrder,
}: {
  order: OrderListItem
  pendingActionId: string | null
  onCancelOrder: (orderId: string, suggestedNote?: string) => Promise<void>
  onViewOrder: (orderId: string) => Promise<void>
}) {
  return (
    <AdminActionGroup>
      <AdminActionButton
        disabled={pendingActionId === `order-detail-${order.id}`}
        onClick={() => void onViewOrder(order.id)}
      >
        Review
      </AdminActionButton>
      {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
        <AdminActionButton
          disabled={pendingActionId === `order-cancel-${order.id}`}
          onClick={() =>
            void onCancelOrder(
              order.id,
              order.cancellationRequest?.reason ?? undefined,
            )
          }
        >
          Cancel Order
        </AdminActionButton>
      ) : null}
    </AdminActionGroup>
  )
}

function AdminPrimaryCell({
  detail,
  title,
}: {
  detail: string
  title: string
}) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#777777]">
        {detail}
      </p>
    </div>
  )
}

function AdminActionGroup({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap justify-end gap-2">{children}</div>
}

function createOverviewMetrics({
  customersTotal,
  ordersTotal,
  productsTotal,
  variantsLoaded,
}: {
  customersTotal: number
  ordersTotal: number
  productsTotal: number
  variantsLoaded: number
}): AdminMetric[] {
  return [
    {
      label: 'Products',
      value: productsTotal.toLocaleString('en-US'),
      detail: 'Admin catalog',
    },
    {
      label: 'Variants',
      value: variantsLoaded.toLocaleString('en-US'),
      detail: 'Loaded from listed products',
    },
    {
      label: 'Orders',
      value: ordersTotal.toLocaleString('en-US'),
      detail: 'Fulfillment queue',
    },
    {
      label: 'Customers',
      value: customersTotal.toLocaleString('en-US'),
      detail: 'Customer accounts',
    },
  ]
}

function getNextOrderStatus(status: OrderStatus) {
  return orderStatusFlow[status]
}

function getCustomerStatusTone(status: CustomerStatus): StatusTone {
  if (status === 'ACTIVE') {
    return 'active'
  }

  if (status === 'BLOCKED') {
    return 'danger'
  }

  return 'neutral'
}

function getOrderStatusTone(status: OrderStatus): StatusTone {
  if (status === 'CANCELLED') {
    return 'danger'
  }

  if (status === 'PENDING' || status === 'PROCESSING') {
    return 'warning'
  }

  return 'active'
}

function getVariantStatusLabel(variant: ProductVariant) {
  if (!variant.isActive) {
    return 'Inactive'
  }

  if (variant.stock <= 0) {
    return 'Out'
  }

  if (variant.stock <= 5) {
    return 'Low'
  }

  return 'In Stock'
}

function getVariantStatusTone(variant: ProductVariant): StatusTone {
  if (!variant.isActive || variant.stock <= 0) {
    return 'danger'
  }

  if (variant.stock <= 5) {
    return 'warning'
  }

  return 'active'
}

function formatProductPrice(price: number) {
  return vndFormatter.format(price).replace(/\s/g, ' ')
}

function formatOrderDate(value: string | null) {
  if (!value) {
    return 'Unknown Date'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown Date'
  }

  return dateFormatter.format(date)
}

function formatOrderId(orderId: string) {
  return `#${orderId.slice(0, 8).toUpperCase()}`
}

function formatProductType(type: ProductListItem['type']) {
  return formatLabel(type)
}

function formatCustomerStatus(status: CustomerStatus) {
  return formatLabel(status)
}

function formatOrderStatus(status: OrderStatus) {
  return formatLabel(status)
}

function formatLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ')
}

function normalizeApiError(error: unknown): ApiError {
  if (isPlainApiError(error)) {
    return error
  }

  return toApiError(error)
}

function isPlainApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    !(error instanceof Error) &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  )
}
