import {
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type HTMLInputTypeAttribute,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { adminApi } from '../../api/adminApi'
import { toApiError } from '../../lib/api'
import type {
  ApiError,
  ProductDetail,
  ProductImage,
  ProductImageInput,
  ProductListItem,
  ProductType,
  ProductVariant,
  Size,
} from '../../types/api'

export type AdminProductFormMode =
  | { kind: 'create' }
  | { kind: 'edit'; product: ProductDetail }

export type AdminVariantFormMode =
  | { kind: 'create'; productId?: string }
  | {
      kind: 'edit'
      productId: string
      productName: string
      variant: ProductVariant
    }

export type AdminProductFormValues = {
  description: string
  images: ProductImageInput[]
  imagesChanged: boolean
  isActive: boolean
  material: string
  name: string
  price: number
  type: ProductType
}

export type AdminVariantFormValues = {
  color: string
  images: ProductImageInput[]
  imagesChanged: boolean
  isActive: boolean
  productId: string
  size: Size
  stock: number
}

type ProductFormState = {
  description: string
  isActive: boolean
  material: string
  name: string
  price: string
  type: ProductType
}

type VariantFormState = {
  color: string
  isActive: boolean
  productId: string
  size: Size
  stock: string
}

type ImageDraft = {
  altText: string
  id: string
  isPrimary: boolean
  sortOrder: string
  url: string
}

type InputMode =
  | 'decimal'
  | 'email'
  | 'none'
  | 'numeric'
  | 'search'
  | 'tel'
  | 'text'
  | 'url'

const productTypeOptions: ProductType[] = ['SHIRT', 'PANT', 'JACKET']
const sizeOptions: Size[] = ['S', 'M', 'L', 'XL']
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageBytes = 5 * 1024 * 1024

export function ProductFormModal({
  mode,
  onClose,
  onSubmit,
}: {
  mode: AdminProductFormMode
  onClose: () => void
  onSubmit: (values: AdminProductFormValues) => Promise<void>
}) {
  const isEdit = mode.kind === 'edit'
  const [form, setForm] = useState<ProductFormState>(() =>
    createProductFormState(mode),
  )
  const [images, setImages] = useState<ImageDraft[]>(() =>
    mode.kind === 'edit' ? productImagesToDrafts(mode.product.images) : [],
  )
  const [imagesChanged, setImagesChanged] = useState(mode.kind === 'create')
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const isBusy = isUploadingImages || isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateProductForm(form, images)

    if (validation.length) {
      setFormError(validation.join(' '))
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await onSubmit({
        description: form.description.trim(),
        images: imageDraftsToPayload(images),
        imagesChanged,
        isActive: form.isActive,
        material: form.material.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        type: form.type,
      })
    } catch (error) {
      setFormError(normalizeApiError(error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      description={
        isEdit
          ? 'Update product data, active status, and product-level images.'
          : 'Create the product record first. Variants are added after the product exists.'
      }
      isBusy={isBusy}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add Product'}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {formError ? <FormError message={formError} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <TextInput
            label="Name"
            value={form.name}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />
          <SelectInput
            label="Type"
            value={form.type}
            options={productTypeOptions.map((type) => ({
              label: formatLabel(type),
              value: type,
            }))}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                type: value as ProductType,
              }))
            }
          />
          <TextInput
            label="Material"
            value={form.material}
            onChange={(value) =>
              setForm((current) => ({ ...current, material: value }))
            }
          />
          <TextInput
            inputMode="numeric"
            label="Price"
            type="number"
            value={form.price}
            onChange={(value) =>
              setForm((current) => ({ ...current, price: value }))
            }
          />
        </div>

        <TextAreaInput
          label="Description"
          value={form.description}
          onChange={(value) =>
            setForm((current) => ({ ...current, description: value }))
          }
        />

        {isEdit ? (
          <CheckboxInput
            checked={form.isActive}
            label="Product is active"
            onChange={(checked) =>
              setForm((current) => ({ ...current, isActive: checked }))
            }
          />
        ) : null}

        <ImageDraftEditor
          allowEmpty={false}
          images={images}
          isBusy={isBusy}
          onImagesTouched={() => setImagesChanged(true)}
          onUploadingChange={setIsUploadingImages}
          setImages={setImages}
        />

        <FormActions
          isBusy={isBusy}
          onClose={onClose}
          submitLabel={isEdit ? 'Save Product' : 'Create Product'}
          busyLabel={isUploadingImages ? 'Uploading Images' : 'Saving'}
        />
      </form>
    </AdminModal>
  )
}

export function VariantFormModal({
  mode,
  onClose,
  onSubmit,
  products,
}: {
  mode: AdminVariantFormMode
  onClose: () => void
  onSubmit: (values: AdminVariantFormValues) => Promise<void>
  products: ProductListItem[]
}) {
  const isEdit = mode.kind === 'edit'
  const [form, setForm] = useState<VariantFormState>(() =>
    createVariantFormState(mode, products),
  )
  const [images, setImages] = useState<ImageDraft[]>(() =>
    mode.kind === 'edit' ? productImagesToDrafts(mode.variant.images) : [],
  )
  const [imagesChanged, setImagesChanged] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  const isBusy = isUploadingImages || isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validation = validateVariantForm(form, products)

    if (validation.length) {
      setFormError(validation.join(' '))
      return
    }

    setIsSubmitting(true)
    setFormError('')

    try {
      await onSubmit({
        color: form.color.trim(),
        images: imageDraftsToPayload(images),
        imagesChanged,
        isActive: form.isActive,
        productId: form.productId,
        size: form.size,
        stock: Number(form.stock),
      })
    } catch (error) {
      setFormError(normalizeApiError(error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AdminModal
      description={
        isEdit
          ? `Update ${mode.productName} variant details, stock, active status, and optional images.`
          : 'Create one size and color stock combination for a product.'
      }
      isBusy={isBusy}
      onClose={onClose}
      title={isEdit ? 'Edit Variant' : 'Add Variant'}
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {formError ? <FormError message={formError} /> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <SelectInput
            disabled={isEdit}
            label="Product"
            value={form.productId}
            options={products.map((product) => ({
              label: product.name,
              value: product.id,
            }))}
            onChange={(value) =>
              setForm((current) => ({ ...current, productId: value }))
            }
          />
          <SelectInput
            label="Size"
            value={form.size}
            options={sizeOptions.map((size) => ({ label: size, value: size }))}
            onChange={(value) =>
              setForm((current) => ({ ...current, size: value as Size }))
            }
          />
          <TextInput
            label="Color"
            value={form.color}
            onChange={(value) =>
              setForm((current) => ({ ...current, color: value }))
            }
          />
          <TextInput
            inputMode="numeric"
            label="Stock"
            type="number"
            value={form.stock}
            onChange={(value) =>
              setForm((current) => ({ ...current, stock: value }))
            }
          />
        </div>

        {isEdit ? (
          <CheckboxInput
            checked={form.isActive}
            label="Variant is active"
            onChange={(checked) =>
              setForm((current) => ({ ...current, isActive: checked }))
            }
          />
        ) : null}

        <ImageDraftEditor
          allowEmpty
          images={images}
          isBusy={isBusy}
          onImagesTouched={() => setImagesChanged(true)}
          onUploadingChange={setIsUploadingImages}
          setImages={setImages}
        />

        <FormActions
          isBusy={isBusy}
          onClose={onClose}
          submitLabel={isEdit ? 'Save Variant' : 'Create Variant'}
          busyLabel={isUploadingImages ? 'Uploading Images' : 'Saving'}
        />
      </form>
    </AdminModal>
  )
}

function AdminModal({
  children,
  description,
  isBusy,
  onClose,
  title,
}: {
  children: ReactNode
  description: string
  isBusy: boolean
  onClose: () => void
  title: string
}) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#111111]/45 px-4 py-6 sm:py-10"
      role="dialog"
    >
      <div className="w-full max-w-4xl border border-[#111111] bg-[#f4f4f1] text-[#111111] shadow-2xl">
        <div className="flex flex-col gap-4 border-b border-[#d3d3d3] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
              Admin Catalog
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase leading-none">
              {title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[#555555]">
              {description}
            </p>
          </div>
          <button
            type="button"
            className="h-10 border border-[#111111] px-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777]"
            disabled={isBusy}
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-5 py-5 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  )
}

function ImageDraftEditor({
  allowEmpty,
  images,
  isBusy,
  onImagesTouched,
  onUploadingChange,
  setImages,
}: {
  allowEmpty: boolean
  images: ImageDraft[]
  isBusy: boolean
  onImagesTouched: () => void
  onUploadingChange: (isUploading: boolean) => void
  setImages: Dispatch<SetStateAction<ImageDraft[]>>
}) {
  const [uploadError, setUploadError] = useState('')

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? [])
    event.currentTarget.value = ''

    if (!files.length) {
      return
    }

    const invalidFile = files.find((file) => {
      return (
        !allowedImageTypes.includes(file.type) || file.size > maxImageBytes
      )
    })

    if (invalidFile) {
      setUploadError(
        'Images must be JPEG, PNG, or WEBP files and 5MB or smaller.',
      )
      return
    }

    setUploadError('')
    onUploadingChange(true)

    try {
      const results = await Promise.all(
        files.map((file) => adminApi.uploadProductImage(file)),
      )

      setImages((currentImages) => {
        const baseLength = currentImages.length
        const nextImages = results.map((result, index) => ({
          altText: files[index]?.name.replace(/\.[^.]+$/, '') ?? 'Product image',
          id: createDraftId(),
          isPrimary: currentImages.length === 0 && index === 0,
          sortOrder: String(baseLength + index),
          url: result.url,
        }))

        return ensureOnePrimary([...currentImages, ...nextImages])
      })
      onImagesTouched()
    } catch (error) {
      setUploadError(normalizeApiError(error).message)
    } finally {
      onUploadingChange(false)
    }
  }

  function updateImage(id: string, patch: Partial<ImageDraft>) {
    setImages((currentImages) =>
      ensureOnePrimary(
        currentImages.map((image) =>
          image.id === id ? { ...image, ...patch } : image,
        ),
      ),
    )
    onImagesTouched()
  }

  function removeImage(id: string) {
    if (!allowEmpty && images.length <= 1) {
      setUploadError('Product must keep at least one image.')
      return
    }

    setImages((currentImages) =>
      ensureOnePrimary(currentImages.filter((image) => image.id !== id)),
    )
    onImagesTouched()
  }

  return (
    <section className="border border-[#d3d3d3] bg-[#e7e7e3]/60 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#777777]">
            Images
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#555555]">
            Upload JPEG, PNG, or WEBP images. Product images require at least one
            file; variant images are optional.
          </p>
        </div>
        <label className="inline-flex h-10 cursor-pointer items-center justify-center border border-[#111111] px-4 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-[#111111] hover:text-white">
          Upload
          <input
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isBusy}
            multiple
            type="file"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {uploadError ? <FormError message={uploadError} /> : null}

      {images.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="grid gap-3 border border-[#d3d3d3] bg-[#f4f4f1] p-3"
            >
              <img
                alt={image.altText || 'Product upload preview'}
                className="aspect-[4/3] w-full border border-[#d3d3d3] object-cover"
                src={image.url}
              />
              <TextInput
                label="Alt Text"
                value={image.altText}
                onChange={(value) => updateImage(image.id, { altText: value })}
              />
              <TextInput
                inputMode="numeric"
                label="Sort Order"
                type="number"
                value={image.sortOrder}
                onChange={(value) =>
                  updateImage(image.id, { sortOrder: value })
                }
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                  <input
                    checked={image.isPrimary}
                    disabled={isBusy}
                    name="primary-image"
                    type="radio"
                    onChange={() => updateImage(image.id, { isPrimary: true })}
                  />
                  Primary
                </label>
                <button
                  type="button"
                  className="h-9 border border-[#7a2e2e] px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#7a2e2e] transition hover:bg-[#7a2e2e] hover:text-white disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777]"
                  disabled={isBusy || (!allowEmpty && images.length <= 1)}
                  onClick={() => removeImage(image.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 border border-dashed border-[#c9c9c9] px-4 py-8 text-center text-sm font-bold uppercase tracking-[0.16em] text-[#555555]">
          No images uploaded
        </div>
      )}
    </section>
  )
}

function FormActions({
  busyLabel,
  isBusy,
  onClose,
  submitLabel,
}: {
  busyLabel: string
  isBusy: boolean
  onClose: () => void
  submitLabel: string
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-[#d3d3d3] pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        className="h-11 border border-[#111111] px-5 text-xs font-bold uppercase tracking-[0.16em] transition hover:bg-[#111111] hover:text-white disabled:cursor-not-allowed disabled:border-[#bdbdbd] disabled:text-[#777777]"
        disabled={isBusy}
        onClick={onClose}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="h-11 border border-[#111111] bg-[#111111] px-5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:border-[#777777] disabled:bg-[#777777]"
        disabled={isBusy}
      >
        {isBusy ? busyLabel : submitLabel}
      </button>
    </div>
  )
}

function TextInput({
  inputMode,
  label,
  onChange,
  type = 'text',
  value,
}: {
  inputMode?: InputMode
  label: string
  onChange: (value: string) => void
  type?: HTMLInputTypeAttribute
  value: string
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
        {label}
      </span>
      <input
        className="mt-2 h-11 w-full border border-[#d3d3d3] bg-white px-3 text-sm font-semibold text-[#111111] outline-none transition focus:border-[#111111]"
        inputMode={inputMode}
        min={type === 'number' ? 0 : undefined}
        type={type}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function TextAreaInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
        {label}
      </span>
      <textarea
        className="mt-2 min-h-28 w-full resize-y border border-[#d3d3d3] bg-white px-3 py-3 text-sm font-semibold leading-6 text-[#111111] outline-none transition focus:border-[#111111]"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function SelectInput({
  disabled = false,
  label,
  onChange,
  options,
  value,
}: {
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  value: string
}) {
  return (
    <label className="block">
      <span className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[#777777]">
        {label}
      </span>
      <select
        className="mt-2 h-11 w-full border border-[#d3d3d3] bg-white px-3 text-sm font-semibold text-[#111111] outline-none transition focus:border-[#111111] disabled:cursor-not-allowed disabled:bg-[#e7e7e3]"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function CheckboxInput({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#111111]">
      <input
        checked={checked}
        type="checkbox"
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      {label}
    </label>
  )
}

function FormError({ message }: { message: string }) {
  return (
    <div
      className="mt-4 border border-[#7a2e2e] bg-[#7a2e2e]/5 px-4 py-3 text-sm font-semibold leading-6 text-[#7a2e2e]"
      role="alert"
    >
      {message}
    </div>
  )
}

function createProductFormState(mode: AdminProductFormMode): ProductFormState {
  if (mode.kind === 'edit') {
    return {
      description: mode.product.description,
      isActive: mode.product.isActive,
      material: mode.product.material,
      name: mode.product.name,
      price: String(mode.product.price),
      type: mode.product.type,
    }
  }

  return {
    description: '',
    isActive: true,
    material: '',
    name: '',
    price: '',
    type: 'SHIRT',
  }
}

function createVariantFormState(
  mode: AdminVariantFormMode,
  products: ProductListItem[],
): VariantFormState {
  if (mode.kind === 'edit') {
    return {
      color: mode.variant.color,
      isActive: mode.variant.isActive,
      productId: mode.productId,
      size: mode.variant.size,
      stock: String(mode.variant.stock),
    }
  }

  return {
    color: '',
    isActive: true,
    productId: mode.productId ?? products[0]?.id ?? '',
    size: 'S',
    stock: '0',
  }
}

function productImagesToDrafts(images: ProductImage[]) {
  return ensureOnePrimary(
    images.map((image) => ({
      altText: image.altText ?? '',
      id: image.id,
      isPrimary: image.isPrimary,
      sortOrder: String(image.sortOrder),
      url: image.url,
    })),
  )
}

function validateProductForm(form: ProductFormState, images: ImageDraft[]) {
  const errors: string[] = []
  const price = Number(form.price)

  if (!form.name.trim()) {
    errors.push('Name is required.')
  }

  if (!form.description.trim()) {
    errors.push('Description is required.')
  }

  if (!form.material.trim()) {
    errors.push('Material is required.')
  }

  if (!Number.isFinite(price) || price < 0) {
    errors.push('Price must be zero or higher.')
  }

  if (!images.length) {
    errors.push('Upload at least one product image.')
  }

  return errors
}

function validateVariantForm(
  form: VariantFormState,
  products: ProductListItem[],
) {
  const errors: string[] = []
  const stock = Number(form.stock)

  if (!products.some((product) => product.id === form.productId)) {
    errors.push('Select a product.')
  }

  if (!form.color.trim()) {
    errors.push('Color is required.')
  }

  if (!Number.isInteger(stock) || stock < 0) {
    errors.push('Stock must be a whole number zero or higher.')
  }

  return errors
}

function imageDraftsToPayload(images: ImageDraft[]): ProductImageInput[] {
  const normalizedImages = ensureOnePrimary(images)

  return normalizedImages.map((image, index) => {
    const sortOrder = Number(image.sortOrder)

    return {
      altText: image.altText.trim() || undefined,
      isPrimary: image.isPrimary,
      sortOrder: Number.isInteger(sortOrder) && sortOrder >= 0 ? sortOrder : index,
      url: image.url,
    }
  })
}

function ensureOnePrimary(images: ImageDraft[]) {
  if (!images.length) {
    return images
  }

  const primaryIndex = images.findIndex((image) => image.isPrimary)
  const nextPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0

  return images.map((image, index) => ({
    ...image,
    isPrimary: index === nextPrimaryIndex,
  }))
}

function createDraftId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `image-${Date.now()}-${Math.random().toString(16).slice(2)}`
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
