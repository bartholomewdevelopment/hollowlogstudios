import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { createAddress, deleteAddress, getUserAddresses } from '@/firebase/addressService';
import { getCommissionsByContactEmail } from '@/firebase/commissionService';
import type { Commission, CustomerAddress } from '@/types/customer-portal';

const AccountAddressesPage: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    recipient_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  const commissionAddresses = useMemo(() => {
    return commissions
      .filter((commission) => commission.contact_address_line1)
      .map((commission) => ({
        id: commission.id,
        label: commission.title || 'Commission Contact',
        recipient_name: commission.contact_name || '',
        phone: commission.contact_phone || '',
        line1: commission.contact_address_line1 || '',
        line2: commission.contact_address_line2 || '',
        city: commission.contact_city || '',
        state: commission.contact_state || '',
        postal_code: commission.contact_postal_code || '',
        country: commission.contact_country || '',
      }));
  }, [commissions]);

  useEffect(() => {
    if (!user?.id || !user?.email) return;

    const loadAddresses = async () => {
      try {
        setLoading(true);
        const [addressData, commissionData] = await Promise.all([
          getUserAddresses(user.id),
          getCommissionsByContactEmail(user.email),
        ]);
        setAddresses(addressData);
        setCommissions(commissionData);
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [user?.email, user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setSaving(true);
      const newAddress = await createAddress({
        user_id: user.id,
        label: formData.label || undefined,
        recipient_name: formData.recipient_name || undefined,
        phone: formData.phone || undefined,
        line1: formData.line1,
        line2: formData.line2 || undefined,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        source: 'manual',
        is_default: false,
      });
      setAddresses((prev) => [newAddress, ...prev]);
      setFormData({
        label: '',
        recipient_name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      });
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteAddress(id);
    if (ok) {
      setAddresses((prev) => prev.filter((address) => address.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Addresses</h1>
        <p className="text-sm text-gray-600">
          Keep shipping addresses on file and see commission contact locations.
        </p>
      </div>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg">Add a new address</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                name="label"
                placeholder="Home, Studio, etc."
                value={formData.label}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient_name">Recipient Name</Label>
              <Input
                id="recipient_name"
                name="recipient_name"
                placeholder="Full name"
                value={formData.recipient_name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="line1">Address Line 1 *</Label>
              <Input
                id="line1"
                name="line1"
                placeholder="Street address"
                value={formData.line1}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="line2">Address Line 2</Label>
              <Input
                id="line2"
                name="line2"
                placeholder="Apartment, suite, etc."
                value={formData.line2}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Region *</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code *</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-green-700 hover:bg-green-800"
              >
                {saving ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg">Saved addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-gray-500">Loading addresses...</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No saved addresses yet.</p>
          ) : (
            addresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {address.label || address.recipient_name || 'Saved Address'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postal_code}
                      <br />
                      {address.country}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(address.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg">Commission contact addresses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {commissionAddresses.length === 0 ? (
            <p className="text-sm text-gray-500">No commission addresses yet.</p>
          ) : (
            commissionAddresses.map((address) => (
              <div key={address.id} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900">{address.label}</div>
                      <Badge variant="secondary">Commission</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.postal_code}
                      <br />
                      {address.country}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountAddressesPage;
