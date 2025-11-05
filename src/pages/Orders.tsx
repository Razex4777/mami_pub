import { Badge } from "@/components/ui/data-display/badge";
import { Package, Clock, CheckCircle, Truck } from "lucide-react";

const orders = [
  {
    id: "#ORD-2847",
    date: "2025-01-15",
    status: "In Production",
    items: 3,
    total: 284.97,
    icon: Package,
    color: "text-blue-400",
  },
  {
    id: "#ORD-2846",
    date: "2025-01-14",
    status: "Shipped",
    items: 5,
    total: 449.95,
    icon: Truck,
    color: "text-green-400",
  },
  {
    id: "#ORD-2845",
    date: "2025-01-12",
    status: "Completed",
    items: 2,
    total: 159.98,
    icon: CheckCircle,
    color: "text-gray-400",
  },
  {
    id: "#ORD-2844",
    date: "2025-01-10",
    status: "Pending",
    items: 1,
    total: 34.99,
    icon: Clock,
    color: "text-yellow-400",
  },
];

const Orders = () => {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4">Order Tracking</h1>
          <p className="text-secondary text-lg">
            Monitor production status and delivery timeline
          </p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const Icon = order.icon;
            return (
              <div
                key={order.id}
                className="panel p-6 rounded-lg border border-border hover-lift"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`${order.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{order.id}</h3>
                      <p className="text-sm text-secondary">
                        {order.items} items · Placed {order.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-sm text-muted mb-1">Total</p>
                      <p className="text-xl font-semibold">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="border-border text-sm px-4 py-1"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
