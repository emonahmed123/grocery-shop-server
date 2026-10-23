import { Booking } from '../Booking/booking.model';
import { Product } from '../Products/products.model';
import {
  LOW_STOCK_COUNT,
  LOW_STOCK_LIMIT,
  RECENT_ORDER_COUNT,
  TOP_CATEGORY_COUNT,
} from './stats.constant';

const activeProducts = { isDeleted: false };

const getOrderStats = async () => {
  const [result] = await Booking.aggregate([
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        revenue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0],
          },
        },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
        },
        // still on the way: not delivered and not cancelled
        pendingOrders: {
          $sum: {
            $cond: [
              { $in: ['$status', ['pending', 'confirmed', 'shipped']] },
              1,
              0,
            ],
          },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        customers: { $addToSet: '$userId' },
      },
    },
    {
      $project: {
        _id: 0,
        totalOrders: 1,
        revenue: { $round: ['$revenue', 2] },
        deliveredOrders: 1,
        pendingOrders: 1,
        cancelledOrders: 1,
        customerCount: { $size: '$customers' },
      },
    },
  ]);

  return (
    result ?? {
      totalOrders: 0,
      revenue: 0,
      deliveredOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0,
      customerCount: 0,
    }
  );
};

const getProductStats = async () => {
  const [result] = await Product.aggregate([
    { $match: activeProducts },
    {
      $facet: {
        total: [{ $count: 'count' }],
        categories: [
          { $match: { category: { $nin: [null, ''] } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
          { $project: { _id: 0, category: '$_id', count: 1 } },
        ],
      },
    },
  ]);

  const categories: { category: string; count: number }[] = result.categories;

  return {
    totalProducts: result.total[0]?.count ?? 0,
    categoryCount: categories.length,
    topCategories: categories.slice(0, TOP_CATEGORY_COUNT),
  };
};

const getAdminStatsFromDb = async () => {
  const [orders, products, lowStock, recentOrders] = await Promise.all([
    getOrderStats(),
    getProductStats(),
    // old products without a stock number are left out, not shown as empty
    Product.find({
      ...activeProducts,
      inStock: { $ne: null, $lt: LOW_STOCK_LIMIT },
    })
      .sort('inStock')
      .limit(LOW_STOCK_COUNT)
      .select('name slug image unit inStock'),
    Booking.find()
      .sort('-createdAt')
      .limit(RECENT_ORDER_COUNT)
      .select('userId items totalAmount status createdAt')
      .populate({ path: 'userId', select: 'name' }),
  ]);

  return {
    ...orders,
    ...products,
    lowStockLimit: LOW_STOCK_LIMIT,
    lowStock,
    recentOrders,
  };
};

export const StatsService = {
  getAdminStatsFromDb,
};
