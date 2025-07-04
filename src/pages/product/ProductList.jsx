import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import supabase from "../../utils/supabase";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProducts(data || []);
    } catch (error) {
      console.error("상품 목록 조회 오류:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId, imageUrl) => {
    if (!window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      return;
    }

    try {
      // 1. 데이터베이스에서 상품 삭제
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw error;
      }

      // 2. 이미지가 있는 경우 Storage에서도 삭제
      if (imageUrl) {
        try {
          // URL에서 파일명 추출
          const urlParts = imageUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];

          const { error: storageError } = await supabase.storage
            .from("food-images")
            .remove([fileName]);

          if (storageError) {
            console.error("이미지 삭제 오류:", storageError);
          }
        } catch (storageError) {
          console.error("이미지 삭제 중 오류:", storageError);
        }
      }

      alert("상품이 성공적으로 삭제되었습니다.");
      fetchProducts(); // 목록 새로고침
    } catch (error) {
      console.error("상품 삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다: " + error.message);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">오류: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <h3>ProductList</h3>
        <div className="flex gap-2">
          <Link to="/product/write" className="btn btn-sm">
            Write
          </Link>
          <Link to="/product/list" className="btn btn-sm">
            list
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          등록된 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {product.image_url && (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x300?text=이미지+없음";
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <h4 className="font-semibold text-lg mb-2">{product.name}</h4>
                <p className="text-xl font-bold text-blue-600 mb-2">
                  ₩{formatPrice(product.price)}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  등록일: {formatDate(product.created_at)}
                </p>

                {/* 수정/삭제 버튼 */}
                <div className="flex gap-2">
                  <Link
                    to={`/product/modify/${product.id}`}
                    className="btn btn-sm btn-secondary flex-1"
                  >
                    수정
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id, product.image_url)}
                    className="btn btn-sm btn-error flex-1"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ProductList;
