import { useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import ProductCard from "../components/ProductCard";

const categories = ["All pieces", "Casual Dresses", "Party Wear", "Western Wear", "Traditional Wear", "Tops", "Ethnic Wear"];

function Shop({ gender = "" }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("q") || "";
  const category = params.get("category") || "All pieces";
  const sort = params.get("sort") || "popular";

  const chooseCategory = value => {
    const next = new URLSearchParams(params);
    if (value === "All pieces") next.delete("category");
    else next.set("category", value);
    setParams(next);
  };

  const updateSearch = value => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value);
    else next.delete("q");
    setParams(next, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const result = products.filter(product => {
      const matchesSearch = !normalizedSearch
        || `${product.name} ${product.category} ${product.color}`.toLowerCase().includes(normalizedSearch);
      const matchesCategory = category === "All pieces" || product.category === category;
      const matchesGender = !gender || product.gender === gender;
      return matchesSearch && matchesCategory && matchesGender;
    });
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "popular") result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [category, gender, search, sort]);

  const clearFilters = () => {
    setParams({});
  };

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <div className="shop-hero-copy">
          <span className="eyebrow">THE MAISON MUSE COLLECTION</span>
          <h1>{gender ? `${gender}'s edit` : "Wear what feels like you."}</h1>
          <p>Considered pieces for all the in-between moments that make a life.</p>
        </div>
        <span className="shop-hero-side-note">A LITTLE MORE YOU, EVERY DAY</span>
      </section>

      <section className="section-shell catalog-section" id="categories">
        <div className="catalog-topline">
          <div className="category-pills" aria-label="Filter by category">
            {categories.map(item => (
              <button
                type="button"
                key={item}
                className={`category-pill${category === item ? " active" : ""}`}
                onClick={() => chooseCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="catalog-tools">
            <label className="catalog-search">
              <Search size={16} />
              <span className="visually-hidden">Search collection</span>
              <input value={search} onChange={event => updateSearch(event.target.value)} placeholder="Search the collection" />
              {search && <button type="button" aria-label="Clear search" onClick={() => updateSearch("")}><X size={15} /></button>}
            </label>
            <label className="sort-select">
              <SlidersHorizontal size={15} />
              <span className="visually-hidden">Sort products</span>
              <select value={sort} onChange={event => {
                const next = new URLSearchParams(params);
                next.set("sort", event.target.value);
                setParams(next);
              }}>
                <option value="popular">Most loved</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        <div className="catalog-count">
          <span>{filteredProducts.length} thoughtful {filteredProducts.length === 1 ? "piece" : "pieces"}</span>
          {(search || category !== "All pieces" || params.size > 0) && (
            <button type="button" onClick={clearFilters}>Clear filters <X size={13} /></button>
          )}
        </div>
        {filteredProducts.length ? (
          <div className="product-grid">
            {filteredProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-mark">✳</span>
            <h2>Nothing on this rail just yet.</h2>
            <p>Try another search or take a look at all our lovely pieces.</p>
            <button type="button" className="button button-dark" onClick={clearFilters}>See all pieces</button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Shop;
