import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import supabase from "../../utils/supabase";

function ProductModi() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      setProduct(data);
      setFormData({
        name: data.name,
        price: data.price.toString(),
      });
      if (data.image_url) {
        setPreviewUrl(data.image_url);
      }
    } catch (error) {
      console.error("상품 조회 오류:", error);
      alert("상품 정보를 불러오는데 실패했습니다.");
      navigate("/product/list");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // 파일 미리보기 URL 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    // input 요소의 값도 초기화
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const uploadImageToStorage = async (file) => {
    try {
      // 파일명에 타임스탬프 추가하여 중복 방지
      const timestamp = Date.now();
      const fileExt = file.name.split(".").pop();
      const fileName = `${timestamp}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("food-images")
        .upload(fileName, file);

      if (error) {
        throw error;
      }

      // 업로드된 파일의 공개 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("food-images").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      throw error;
    }
  };

  const updateProductInDatabase = async (name, price, imageUrl) => {
    try {
      const updateData = {
        name: name,
        price: parseInt(price),
      };

      // 새 이미지가 업로드된 경우에만 image_url 업데이트
      if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("상품 수정 오류:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.price.trim()) {
      alert("상품명과 가격을 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = null;

      // 새 이미지가 선택된 경우에만 업로드
      if (selectedFile) {
        imageUrl = await uploadImageToStorage(selectedFile);
      }

      // 상품 정보 업데이트
      await updateProductInDatabase(formData.name, formData.price, imageUrl);

      alert("상품이 성공적으로 수정되었습니다!");
      navigate("/product/list");
    } catch (error) {
      console.error("수정 오류:", error);
      alert("수정 중 오류가 발생했습니다: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">상품을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center py-4">
        <h3>상품 수정</h3>
        <div className="flex gap-2">
          <Link to="/product/write" className="btn btn-sm">
            Write
          </Link>
          <Link to="/product/list" className="btn btn-sm">
            list
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <div>
          <div className="w-full">
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">이미지</legend>
              <input
                type="file"
                className="file-input w-full"
                accept="image/*"
                onChange={handleFileChange}
              />
              <p className="text-sm text-gray-600 mt-1">
                새 이미지를 선택하지 않으면 기존 이미지가 유지됩니다.
              </p>
            </fieldset>

            {/* 미리보기 영역 */}
            {previewUrl && (
              <div className="mt-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="max-w-xs max-h-48 object-contain border rounded-lg shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                    title="이미지 제거"
                  >
                    ×
                  </button>
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    파일명: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full ">
            <fieldset className="fieldset w-full">
              <legend className="fieldset-legend">제품명</legend>
              <input
                type="text"
                className="input w-full"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="상품명을 입력하세요"
                required
              />
            </fieldset>
          </div>
          <div className="w-full">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">가격</legend>
              <input
                type="number"
                className="input w-full"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="가격을 입력하세요"
                min="0"
                required
              />
            </fieldset>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Link to="/product/list" className="btn btn-secondary">
            취소
          </Link>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "수정 중..." : "수정"}
          </button>
        </div>
      </form>
    </>
  );
}

export default ProductModi;
