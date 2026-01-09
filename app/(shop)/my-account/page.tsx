'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { Section, Container } from '@/components/craft';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, User, MapPin, LogOut, Loader2, Eye, LayoutDashboard, Download, CreditCard, Edit, Save, X, Heart, Repeat2, ShoppingCart, Trash2 } from 'lucide-react';
import { getCustomerOrdersAction, updateCustomerAction } from '@/app/actions/auth';
import type { Order } from '@/types/woocommerce';
import { format } from 'date-fns';
import { toast } from 'sonner';

function MyAccountContent() {
  const { user, isAuthenticated, logout, setUser } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Profile editing state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });

  // Address editing state
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [billingData, setBillingData] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    postcode: '',
    country: 'SE',
    phone: '',
  });
  const [shippingData, setShippingData] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    postcode: '',
    country: 'SE',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Wishlist and Cart stores
  const { items: wishlistItems, getItemsByList, removeItem: removeFromWishlist, moveToCart } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  // Handle tab query parameter
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['dashboard', 'orders', 'downloads', 'addresses', 'payment', 'profile', 'wishlist'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Initialize form data from user
  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
      setBillingData({
        first_name: user.billing?.first_name || user.first_name || '',
        last_name: user.billing?.last_name || user.last_name || '',
        address_1: user.billing?.address_1 || '',
        address_2: user.billing?.address_2 || '',
        city: user.billing?.city || '',
        postcode: user.billing?.postcode || '',
        country: user.billing?.country || 'SE',
        phone: user.billing?.phone || '',
      });
      setShippingData({
        first_name: user.shipping?.first_name || user.first_name || '',
        last_name: user.shipping?.last_name || user.last_name || '',
        address_1: user.shipping?.address_1 || '',
        address_2: user.shipping?.address_2 || '',
        city: user.shipping?.city || '',
        postcode: user.shipping?.postcode || '',
        country: user.shipping?.country || 'SE',
      });
    }
  }, [user]);

  // Fetch customer orders
  useEffect(() => {
    async function fetchOrders() {
      console.log('Fetching orders for user:', user);
      console.log('User ID:', user?.id);

      if (!user?.id || user.id === 0) {
        console.log('No valid user ID, skipping order fetch');
        setIsLoadingOrders(false);
        setOrdersError(
          'Your account is not properly linked to our order system. This usually happens when there was an issue creating your customer profile. Please contact our support team to resolve this issue.'
        );
        return;
      }

      try {
        setIsLoadingOrders(true);
        setOrdersError(null);
        console.log('Calling getCustomerOrdersAction with ID:', user.id);
        const result = await getCustomerOrdersAction(user.id, {
          per_page: 20,
          page: 1,
          email: user.email,
        });

        console.log('Orders result:', result);

        if (result.success && result.data) {
          setOrders(result.data);
          console.log('Loaded', result.data.length, 'orders');
        } else {
          setOrdersError(result.error || 'Failed to load orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersError('An unexpected error occurred');
      } finally {
        setIsLoadingOrders(false);
      }
    }

    if (user) {
      fetchOrders();
    } else {
      setIsLoadingOrders(false);
    }
  }, [user?.id, user]);

  if (!user) return null;

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!user?.id) {
      toast.error('Unable to update profile');
      return;
    }

    setIsSavingProfile(true);
    try {
      const result = await updateCustomerAction(user.id, {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
      });

      if (result.success && result.data) {
        setUser(result.data);
        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save billing address
  const handleSaveBilling = async () => {
    if (!user?.id) {
      toast.error('Unable to update address');
      return;
    }

    setIsSavingAddress(true);
    try {
      const result = await updateCustomerAction(user.id, {
        billing: billingData,
      });

      if (result.success && result.data) {
        setUser(result.data);
        toast.success('Billing address updated successfully!');
        setIsEditingBilling(false);
      } else {
        toast.error(result.error || 'Failed to update billing address');
      }
    } catch (error) {
      toast.error('Failed to update billing address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Save shipping address
  const handleSaveShipping = async () => {
    if (!user?.id) {
      toast.error('Unable to update address');
      return;
    }

    setIsSavingAddress(true);
    try {
      const result = await updateCustomerAction(user.id, {
        shipping: shippingData,
      });

      if (result.success && result.data) {
        setUser(result.data);
        toast.success('Shipping address updated successfully!');
        setIsEditingShipping(false);
      } else {
        toast.error(result.error || 'Failed to update shipping address');
      }
    } catch (error) {
      toast.error('Failed to update shipping address');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Helper function to get order status badge variant
  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processing</Badge>;
      case 'on-hold':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">On Hold</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Pending Payment</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Section className="bg-neutral-50 dark:bg-neutral-900/50">
      <Container>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-primary-950 dark:text-primary-50">
              My Account
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Welcome back, {user.first_name}!
            </p>
          </div>
          <Button variant="outline" onClick={() => logout()} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="downloads" className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Downloads</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Overview of your account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                    const ordersTab = document.querySelector('[value="orders"]') as HTMLElement;
                    ordersTab?.click();
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Orders</h3>
                    </div>
                    <p className="text-2xl font-bold">{orders.length}</p>
                    <p className="text-sm text-muted-foreground">Total orders placed</p>
                  </div>

                  <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                    const wishlistTab = document.querySelector('[value="wishlist"]') as HTMLElement;
                    wishlistTab?.click();
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Wishlist</h3>
                    </div>
                    <p className="text-2xl font-bold">{wishlistItems.length}</p>
                    <p className="text-sm text-muted-foreground">Saved items</p>
                  </div>

                  <div className="rounded-lg border p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => {
                    const addressesTab = document.querySelector('[value="addresses"]') as HTMLElement;
                    addressesTab?.click();
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Addresses</h3>
                    </div>
                    <p className="text-2xl font-bold">{user.billing?.address_1 ? '2' : '0'}</p>
                    <p className="text-sm text-muted-foreground">Saved addresses</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  <div className="grid gap-3 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{user.first_name} {user.last_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Customer Since:</span>
                      <span className="font-medium">{user.date_created ? format(new Date(user.date_created), 'MMM dd, yyyy') : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads">
            <Card>
              <CardHeader>
                <CardTitle>Downloads</CardTitle>
                <CardDescription>Access your downloadable products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                  <Download className="mb-2 h-8 w-8 text-neutral-400" />
                  <p className="text-sm text-neutral-500">No downloadable products yet.</p>
                  <Button variant="link" onClick={() => router.push('/shop')}>
                    Browse Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your recent orders.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="flex h-48 flex-col items-center justify-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-neutral-500">Loading your orders...</p>
                  </div>
                ) : ordersError ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-red-200 bg-red-50 text-center dark:border-red-800 dark:bg-red-900/10">
                    <Package className="mb-2 h-8 w-8 text-red-400" />
                    <p className="text-sm text-red-600 dark:text-red-400">{ordersError}</p>
                    <Button variant="link" onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                    <Package className="mb-2 h-8 w-8 text-neutral-400" />
                    <p className="text-sm text-neutral-500">No orders found yet.</p>
                    <Button variant="link" onClick={() => router.push('/shop')}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-lg border border-neutral-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <div>
                              <h3 className="font-semibold">Order #{order.number || order.id}</h3>
                              <p className="text-sm text-neutral-500">
                                {format(new Date(order.date_created), 'MMM dd, yyyy')} at{' '}
                                {format(new Date(order.date_created), 'hh:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getOrderStatusBadge(order.status)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.line_items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center gap-3 text-sm">
                              {item.image?.src && (
                                <div className="relative h-12 w-12 flex-shrink-0">
                                  <Image
                                    src={item.image.src}
                                    alt={item.name}
                                    fill
                                    sizes="48px"
                                    className="rounded object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                <p className="text-neutral-500">
                                  Quantity: {item.quantity} × {order.currency} {item.price}
                                </p>
                              </div>
                              <p className="font-semibold">
                                {order.currency} {item.total}
                              </p>
                            </div>
                          ))}
                          {order.line_items.length > 3 && (
                            <p className="text-sm text-neutral-500">
                              +{order.line_items.length - 3} more item(s)
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3 dark:border-neutral-800">
                          <div className="text-sm">
                            <span className="text-neutral-500">Total: </span>
                            <span className="text-lg font-bold text-primary">
                              {order.currency} {order.total}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Add all items from this order to cart
                                let addedCount = 0;
                                order.line_items.forEach((item) => {
                                  // We need to fetch the actual product, but for now we'll show a toast
                                  addedCount++;
                                });
                                toast.success(`${addedCount} items added to cart from order #${order.number || order.id}`);
                                router.push('/cart');
                              }}
                            >
                              <Repeat2 className="mr-2 h-4 w-4" />
                              Reorder
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/my-account/orders/${order.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wishlist">
            <Card>
              <CardHeader>
                <CardTitle>My Wishlist</CardTitle>
                <CardDescription>Items you've saved for later</CardDescription>
              </CardHeader>
              <CardContent>
                {wishlistItems.length === 0 ? (
                  <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                    <Heart className="mb-2 h-8 w-8 text-neutral-400" />
                    <p className="text-sm text-neutral-500">Your wishlist is empty.</p>
                    <Button variant="link" onClick={() => router.push('/shop')}>
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        {item.product.images?.[0]?.src && (
                          <div className="relative h-20 w-20 flex-shrink-0">
                            <Image
                              src={item.product.images[0].src}
                              alt={item.product.name}
                              fill
                              sizes="80px"
                              className="rounded object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.product.name}</h4>
                          {item.variation && (
                            <p className="text-sm text-neutral-500">
                              {item.variation.attributes?.map((attr) => attr.option).join(', ')}
                            </p>
                          )}
                          <p className="mt-1 text-lg font-bold text-primary">
                            {item.product.currency || 'SEK'}{' '}{item.currentPrice.toFixed(2)}
                          </p>
                          {item.notes && (
                            <p className="mt-1 text-sm italic text-neutral-500">{item.notes}</p>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant={item.priority === 'high' ? 'default' : 'secondary'}>
                              {item.priority} priority
                            </Badge>
                            {item.currentPrice < item.originalPrice && (
                              <Badge variant="destructive">
                                Price Drop: {Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100)}% off
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              moveToCart(item.id, (product, variation) => {
                                addToCart(product, 1, variation);
                              });
                              toast.success(`${item.product.name} moved to cart`);
                            }}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              removeFromWishlist(item.id);
                              toast.info(`${item.product.name} removed from wishlist`);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </div>
                  {!isEditingProfile ? (
                    <Button onClick={() => setIsEditingProfile(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        size="sm"
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            first_name: user.first_name || '',
                            last_name: user.last_name || '',
                            email: user.email || '',
                          });
                        }}
                        variant="outline"
                        size="sm"
                        disabled={isSavingProfile}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                      disabled={!isEditingProfile || isSavingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                      disabled={!isEditingProfile || isSavingProfile}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditingProfile || isSavingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={user.username} disabled />
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>Addresses</CardTitle>
                <CardDescription>Manage your billing and shipping addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Billing Address */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Billing Address</h3>
                      {!isEditingBilling ? (
                        <Button onClick={() => setIsEditingBilling(true)} variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            onClick={handleSaveBilling}
                            size="sm"
                            disabled={isSavingAddress}
                          >
                            {isSavingAddress ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditingBilling(false);
                              setBillingData({
                                first_name: user.billing?.first_name || user.first_name || '',
                                last_name: user.billing?.last_name || user.last_name || '',
                                address_1: user.billing?.address_1 || '',
                                address_2: user.billing?.address_2 || '',
                                city: user.billing?.city || '',
                                postcode: user.billing?.postcode || '',
                                country: user.billing?.country || 'SE',
                                phone: user.billing?.phone || '',
                              });
                            }}
                            variant="ghost"
                            size="sm"
                            disabled={isSavingAddress}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {!isEditingBilling ? (
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                        <p>{user.billing?.first_name} {user.billing?.last_name}</p>
                        <p>{user.billing?.address_1}</p>
                        {user.billing?.address_2 && <p>{user.billing.address_2}</p>}
                        <p>{user.billing?.city}, {user.billing?.postcode}</p>
                        <p>{user.billing?.country}</p>
                        {user.billing?.phone && <p>Phone: {user.billing.phone}</p>}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">First Name</Label>
                            <Input
                              value={billingData.first_name}
                              onChange={(e) => setBillingData({ ...billingData, first_name: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Last Name</Label>
                            <Input
                              value={billingData.last_name}
                              onChange={(e) => setBillingData({ ...billingData, last_name: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Address Line 1</Label>
                          <Input
                            value={billingData.address_1}
                            onChange={(e) => setBillingData({ ...billingData, address_1: e.target.value })}
                            disabled={isSavingAddress}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Address Line 2</Label>
                          <Input
                            value={billingData.address_2}
                            onChange={(e) => setBillingData({ ...billingData, address_2: e.target.value })}
                            disabled={isSavingAddress}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">City</Label>
                            <Input
                              value={billingData.city}
                              onChange={(e) => setBillingData({ ...billingData, city: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Postcode</Label>
                            <Input
                              value={billingData.postcode}
                              onChange={(e) => setBillingData({ ...billingData, postcode: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Phone</Label>
                          <Input
                            value={billingData.phone}
                            onChange={(e) => setBillingData({ ...billingData, phone: e.target.value })}
                            disabled={isSavingAddress}
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Shipping Address</h3>
                      {!isEditingShipping ? (
                        <Button onClick={() => setIsEditingShipping(true)} variant="ghost" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            onClick={handleSaveShipping}
                            size="sm"
                            disabled={isSavingAddress}
                          >
                            {isSavingAddress ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setIsEditingShipping(false);
                              setShippingData({
                                first_name: user.shipping?.first_name || user.first_name || '',
                                last_name: user.shipping?.last_name || user.last_name || '',
                                address_1: user.shipping?.address_1 || '',
                                address_2: user.shipping?.address_2 || '',
                                city: user.shipping?.city || '',
                                postcode: user.shipping?.postcode || '',
                                country: user.shipping?.country || 'SE',
                              });
                            }}
                            variant="ghost"
                            size="sm"
                            disabled={isSavingAddress}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {!isEditingShipping ? (
                      <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                        <p>{user.shipping?.first_name} {user.shipping?.last_name}</p>
                        <p>{user.shipping?.address_1}</p>
                        {user.shipping?.address_2 && <p>{user.shipping.address_2}</p>}
                        <p>{user.shipping?.city}, {user.shipping?.postcode}</p>
                        <p>{user.shipping?.country}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">First Name</Label>
                            <Input
                              value={shippingData.first_name}
                              onChange={(e) => setShippingData({ ...shippingData, first_name: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Last Name</Label>
                            <Input
                              value={shippingData.last_name}
                              onChange={(e) => setShippingData({ ...shippingData, last_name: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Address Line 1</Label>
                          <Input
                            value={shippingData.address_1}
                            onChange={(e) => setShippingData({ ...shippingData, address_1: e.target.value })}
                            disabled={isSavingAddress}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Address Line 2</Label>
                          <Input
                            value={shippingData.address_2}
                            onChange={(e) => setShippingData({ ...shippingData, address_2: e.target.value })}
                            disabled={isSavingAddress}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-xs">City</Label>
                            <Input
                              value={shippingData.city}
                              onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Postcode</Label>
                            <Input
                              value={shippingData.postcode}
                              onChange={(e) => setShippingData({ ...shippingData, postcode: e.target.value })}
                              disabled={isSavingAddress}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods for faster checkout.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                  <CreditCard className="mb-2 h-8 w-8 text-neutral-400" />
                  <p className="text-sm text-neutral-500">No saved payment methods yet.</p>
                  <p className="text-xs text-neutral-400 mt-1">Payment methods will be saved during checkout.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Container>
    </Section>
  );
}

export default function MyAccountPage() {
  return (
    <Suspense fallback={
      <Section className="bg-neutral-50 dark:bg-neutral-900/50">
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </Section>
    }>
      <MyAccountContent />
    </Suspense>
  );
}
