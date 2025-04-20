import { useState, useEffect, useRef } from 'react'
import './App.css'

interface Watch {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

interface User {
  email: string;
  password: string;
  name: string;
}

function App() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [filteredWatches, setFilteredWatches] = useState<Watch[]>([]);
  const [cart, setCart] = useState<(Watch & { quantity: number })[]>([]);
  const [wishlist, setWishlist] = useState<Watch[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authInputs, setAuthInputs] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });
  const [authError, setAuthError] = useState('');
  const [showWishlistTooltip, setShowWishlistTooltip] = useState(false);
  const [productsHighlighted, setProductsHighlighted] = useState(false);
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  
  // Time-related quotes for banner
  const quotes = [
    "The future is now. Time is digital.",
    "Precision in every nanosecond, style in every moment.",
    "Where technology meets time, innovation begins.",
    "Time is the new currency. Invest wisely.",
    "Beyond time, beyond limits. The watch of tomorrow."
  ];
  
  // Cycle through quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
    }, 5000);
    
    return () => clearInterval(quoteInterval);
  }, [quotes.length]);
  
  // Mock data for watches
  useEffect(() => {
    const mockWatches: Watch[] = [
      {
        id: 1,
        name: "Quantum Pulse",
        price: 499.99,
        image: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        description: "Digital smartwatch with holographic display and biometric tracking",
        category: "smart"
      },
      {
        id: 2,
        name: "Neon Chrono",
        price: 799.99,
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        description: "Luxury analog watch with LED accents and titanium case",
        category: "luxury"
      },
      {
        id: 3,
        name: "Infinity Edge",
        price: 349.99,
        image: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        description: "Ultra-thin smart watch with curved OLED screen",
        category: "smart"
      },
      {
        id: 4,
        name: "Cyber Mechanic",
        price: 899.99,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        description: "Mechanical watch with exposed gears and blue luminous details",
        category: "mechanical"
      },
      {
        id: 5,
        name: "Binary Flux",
        price: 599.99,
        image: "https://images.unsplash.com/photo-1522312346375-d1a52622a611?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        description: "Digital watch with customizable LED matrix display",
        category: "digital"
      },
      {
        id: 6,
        name: "Matrix Timekeeper",
        price: 299.99,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        description: "Budget-friendly smart watch with fitness tracking",
        category: "smart"
      }
    ];
    
    setWatches(mockWatches);
    setFilteredWatches(mockWatches);
  }, []);

  // Load wishlist data from localStorage regardless of login status
  useEffect(() => {
    const savedUser = localStorage.getItem('cyberwatch_user');
    const savedWishlist = localStorage.getItem('cyberwatch_wishlist');
    
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
    
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  // Filter watches based on search, category, and price
  useEffect(() => {
    let result = watches;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(watch => 
        watch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        watch.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(watch => watch.category === selectedCategory);
    }
    
    // Filter by price range
    result = result.filter(watch => 
      watch.price >= priceRange.min && watch.price <= priceRange.max
    );
    
    setFilteredWatches(result);
  }, [searchTerm, selectedCategory, priceRange, watches]);

  // Add to cart function
  const addToCart = (watch: Watch) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === watch.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === watch.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        return [...prevCart, { ...watch, quantity: 1 }];
      }
    });
  };

  // Remove from cart function
  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Update quantity function
  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // Modify the wishlist functions to work without login
  const addToWishlist = (watch: Watch) => {
    // Show tooltip on first add if not seen before
    const tooltipSeen = localStorage.getItem('wishlist_tooltip_seen');
    if (!tooltipSeen) {
      setShowWishlistTooltip(true);
      localStorage.setItem('wishlist_tooltip_seen', 'true');
      
      // Hide tooltip after 5 seconds
      setTimeout(() => {
        setShowWishlistTooltip(false);
      }, 5000);
    }
    
    if (!wishlist.some(item => item.id === watch.id)) {
      const newWishlist = [...wishlist, watch];
      setWishlist(newWishlist);
      localStorage.setItem('cyberwatch_wishlist', JSON.stringify(newWishlist));
    }
  };
  
  const removeFromWishlist = (id: number) => {
    const newWishlist = wishlist.filter(item => item.id !== id);
    setWishlist(newWishlist);
    localStorage.setItem('cyberwatch_wishlist', JSON.stringify(newWishlist));
  };
  
  const isInWishlist = (id: number) => {
    return wishlist.some(item => item.id === id);
  };
  
  // Authentication functions
  const handleAuthInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAuthInputs(prev => ({ ...prev, [name]: value }));
  };
  
  const toggleAuthMode = () => {
    setAuthMode(prevMode => prevMode === 'login' ? 'register' : 'login');
    setAuthError('');
  };
  
  const handleLogin = () => {
    const { email, password } = authInputs;
    
    if (!email || !password) {
      setAuthError('Please fill in all fields');
      return;
    }
    
    // In a real app, this would be an API call
    const savedUsersString = localStorage.getItem('cyberwatch_users');
    const savedUsers = savedUsersString ? JSON.parse(savedUsersString) : [];
    
    const user = savedUsers.find((u: User) => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowAuth(false);
      localStorage.setItem('cyberwatch_user', JSON.stringify(user));
      
      // Load wishlist
      const savedWishlist = localStorage.getItem(`cyberwatch_wishlist_${email}`);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } else {
      setAuthError('Invalid email or password');
    }
  };
  
  const handleRegister = () => {
    const { email, password, name, confirmPassword } = authInputs;
    
    if (!email || !password || !name) {
      setAuthError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }
    
    // Basic validation
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    
    // In a real app, this would be an API call
    const savedUsersString = localStorage.getItem('cyberwatch_users');
    let savedUsers = savedUsersString ? JSON.parse(savedUsersString) : [];
    
    if (savedUsers.some((u: User) => u.email === email)) {
      setAuthError('Email already exists');
      return;
    }
    
    const newUser = { email, password, name };
    savedUsers.push(newUser);
    
    localStorage.setItem('cyberwatch_users', JSON.stringify(savedUsers));
    localStorage.setItem('cyberwatch_user', JSON.stringify(newUser));
    
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setShowAuth(false);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('cyberwatch_user');
  };

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Available categories from data
  const categories = ['all', ...new Set(watches.map(watch => watch.category))];

  // Add ref for products section
  const productsRef = useRef<HTMLElement>(null);
  
  // Function to scroll to products section
  const scrollToProducts = () => {
    // Reset filters to show all products
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 10000 });
    
    // Scroll to products section with smooth animation
    if (productsRef.current) {
      productsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // Add highlight effect
      setProductsHighlighted(true);
      setTimeout(() => setProductsHighlighted(false), 2000);
    }
  };

  // Function to open product detail
  const openProductDetail = (watch: Watch) => {
    setSelectedWatch(watch);
    setShowProductDetail(true);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <h1 className="logo">CYBER<span>WATCH</span></h1>
        </div>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search watches..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="header-actions">
          <div className="account-icon" onClick={() => setShowAuth(!showAuth)}>
            <span className="material-icons">{isLoggedIn ? 'account_circle' : 'person'}</span>
            {isLoggedIn && <span className="user-indicator"></span>}
          </div>
          <div className="wishlist-icon" onClick={() => setShowWishlist(!showWishlist)}>
            <span className="material-icons">favorite_border</span>
            {wishlist.length > 0 && (
              <span className="wishlist-count">{wishlist.length}</span>
            )}
          </div>
          <div className="cart-icon" onClick={() => setShowCart(!showCart)}>
            <span className="material-icons">shopping_cart</span>
            <span className="cart-count">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
          </div>
        </div>
      </header>
      
      {/* Wishlist tooltip */}
      {showWishlistTooltip && (
        <div className="wishlist-tooltip">
          <span className="material-icons tooltip-icon">info</span>
          <p>Your wishlist is now available without an account! Your items will be saved on this device.</p>
          <button className="close-tooltip" onClick={() => setShowWishlistTooltip(false)}>×</button>
        </div>
      )}
      
      {/* Banner Section */}
      <section className="banner-section">
        <div className="banner-content">
          <div className="banner-overlay"></div>
          <div className="banner-text">
            <h2 className="banner-title">REDEFINE <span>TIME</span></h2>
            <div className="quote-container">
              <p className="animated-quote">{quotes[currentQuoteIndex]}</p>
              <div className="quote-dots">
                {quotes.map((_, index) => (
                  <span 
                    key={index} 
                    className={`quote-dot ${index === currentQuoteIndex ? 'active' : ''}`}
                  ></span>
                ))}
              </div>
            </div>
            <button className="banner-cta" onClick={scrollToProducts}>
              Explore Collection
            </button>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className={`main-content ${productsHighlighted ? 'highlight-section' : ''}`} ref={productsRef}>
        {/* Filters */}
        <aside className="filters">
          <h3>Categories</h3>
          <div className="filter-group">
            {categories.map(category => (
              <button 
                key={category}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
          
          <h3>Price Range</h3>
          <div className="price-range">
            <div className="price-inputs">
              <input 
                type="number" 
                value={priceRange.min}
                onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                placeholder="Min"
              />
              <span>to</span>
              <input 
                type="number" 
                value={priceRange.max}
                onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                placeholder="Max"
              />
            </div>
            <button 
              className="apply-filter"
              onClick={() => {
                // This is handled by the useEffect, but button gives visual feedback
              }}
            >
              Apply
            </button>
          </div>
        </aside>
        
        {/* Product Grid */}
        <section className="products-grid">
          {filteredWatches.length === 0 && (
            <div className="no-products">
              <p>No watches found matching your criteria.</p>
            </div>
          )}
          
          {filteredWatches.map(watch => (
            <div key={watch.id} className="product-card">
              <div className="product-image" onClick={() => openProductDetail(watch)}>
                <img src={watch.image} alt={watch.name} />
                <button 
                  className={`wishlist-btn ${isInWishlist(watch.id) ? 'in-wishlist' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening detail view
                    isInWishlist(watch.id) ? removeFromWishlist(watch.id) : addToWishlist(watch);
                  }}
                >
                  <span className="material-icons">
                    {isInWishlist(watch.id) ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
              <div className="product-info" onClick={() => openProductDetail(watch)}>
                <h3 className="product-name">{watch.name}</h3>
                <p className="product-category">{watch.category}</p>
                <p className="product-description">{watch.description}</p>
                <div className="product-price-cart" onClick={(e) => e.stopPropagation()}>
                  <p className="product-price">${watch.price.toFixed(2)}</p>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(watch)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
      
      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h2>Your Cart</h2>
            <button className="close-cart" onClick={() => setShowCart(false)}>×</button>
          </div>
          
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <h4>{item.name}</h4>
                      <p>${item.price.toFixed(2)}</p>
                    </div>
                    <div className="cart-item-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <button 
                      className="remove-item"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-summary">
                <div className="cart-total">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <button className="checkout-btn">Proceed to Checkout</button>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Wishlist Sidebar */}
      {showWishlist && (
        <div className="wishlist-sidebar">
          <div className="wishlist-header">
            <h2>Your Wishlist</h2>
            <button className="close-wishlist" onClick={() => setShowWishlist(false)}>×</button>
          </div>
          
          {!isLoggedIn && (
            <div className="wishlist-guest-info">
              <span className="material-icons">info</span>
              <p>You're using the wishlist as a guest. <button onClick={() => {
                setShowWishlist(false);
                setShowAuth(true);
                setAuthMode('register');
              }}>Create an account</button> to access your wishlist from any device.</p>
            </div>
          )}
          
          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <p>Your wishlist is empty</p>
            </div>
          ) : (
            <div className="wishlist-items">
              {wishlist.map(item => (
                <div key={item.id} className="wishlist-item">
                  <div className="wishlist-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="wishlist-item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="wishlist-item-actions">
                    <button 
                      className="wishlist-add-to-cart"
                      onClick={() => {
                        addToCart(item);
                        setShowWishlist(false);
                        setShowCart(true);
                      }}
                    >
                      <span className="material-icons">shopping_cart</span>
                    </button>
                    <button 
                      className="wishlist-remove"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Authentication Modal */}
      {showAuth && (
        <div className="auth-modal">
          <div className="auth-content">
            <button className="close-auth" onClick={() => setShowAuth(false)}>×</button>
            
            {isLoggedIn ? (
              <div className="user-profile">
                <div className="user-avatar">
                  <span className="material-icons">account_circle</span>
                </div>
                <h3>Welcome, {currentUser?.name}</h3>
                <p>{currentUser?.email}</p>
                <div className="user-stats">
                  <div className="user-stat">
                    <span className="material-icons">favorite</span>
                    <p>{wishlist.length} items in wishlist</p>
                  </div>
                </div>
                <button className="logout-btn" onClick={handleLogout}>Log Out</button>
              </div>
            ) : (
              <div className="auth-form">
                <div className="auth-tabs">
                  <button 
                    className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                    onClick={() => setAuthMode('login')}
                  >
                    Login
                  </button>
                  <button 
                    className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                    onClick={() => setAuthMode('register')}
                  >
                    Register
                  </button>
                </div>
                
                {authError && <p className="auth-error">{authError}</p>}
                
                {authMode === 'login' ? (
                  <div className="login-form">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={authInputs.email} 
                        onChange={handleAuthInputChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={authInputs.password} 
                        onChange={handleAuthInputChange}
                        placeholder="Enter your password"
                      />
                    </div>
                    <button className="auth-btn" onClick={handleLogin}>Login</button>
                    <p className="auth-switch">
                      Don't have an account? <button onClick={toggleAuthMode}>Register here</button>
                    </p>
                  </div>
                ) : (
                  <div className="register-form">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input 
                        type="text" 
                        id="name" 
                        name="name" 
                        value={authInputs.name} 
                        onChange={handleAuthInputChange}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-email">Email</label>
                      <input 
                        type="email" 
                        id="reg-email" 
                        name="email" 
                        value={authInputs.email} 
                        onChange={handleAuthInputChange}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="reg-password">Password</label>
                      <input 
                        type="password" 
                        id="reg-password" 
                        name="password" 
                        value={authInputs.password} 
                        onChange={handleAuthInputChange}
                        placeholder="Create a password"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="confirm-password">Confirm Password</label>
                      <input 
                        type="password" 
                        id="confirm-password" 
                        name="confirmPassword" 
                        value={authInputs.confirmPassword} 
                        onChange={handleAuthInputChange}
                        placeholder="Confirm your password"
                      />
                    </div>
                    <button className="auth-btn" onClick={handleRegister}>Register</button>
                    <p className="auth-switch">
                      Already have an account? <button onClick={toggleAuthMode}>Login here</button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Product Detail Modal */}
      {showProductDetail && selectedWatch && (
        <div className="product-detail-modal">
          <div className="product-detail-content">
            <button className="close-detail" onClick={() => setShowProductDetail(false)}>×</button>
            
            <div className="product-detail-grid">
              <div className="product-detail-image">
                <img src={selectedWatch.image} alt={selectedWatch.name} />
                <button 
                  className={`detail-wishlist-btn ${isInWishlist(selectedWatch.id) ? 'in-wishlist' : ''}`}
                  onClick={() => isInWishlist(selectedWatch.id) 
                    ? removeFromWishlist(selectedWatch.id) 
                    : addToWishlist(selectedWatch)}
                >
                  <span className="material-icons">
                    {isInWishlist(selectedWatch.id) ? 'favorite' : 'favorite_border'}
                  </span>
                </button>
              </div>
              
              <div className="product-detail-info">
                <h2>{selectedWatch.name}</h2>
                <div className="detail-category">
                  <span className="material-icons">watch</span>
                  <span>{selectedWatch.category.charAt(0).toUpperCase() + selectedWatch.category.slice(1)}</span>
                </div>
                
                <div className="detail-price">
                  <h3>${selectedWatch.price.toFixed(2)}</h3>
                </div>
                
                <div className="detail-description">
                  <h4>Description</h4>
                  <p>{selectedWatch.description}</p>
                  <p>Experience the future of timekeeping with the {selectedWatch.name}. This advanced timepiece combines cutting-edge technology with sleek design to create a watch that's as functional as it is stylish.</p>
                </div>
                
                <div className="detail-features">
                  <h4>Features</h4>
                  <ul>
                    <li>Durable {selectedWatch.category === 'luxury' ? 'titanium' : 'polycarbonate'} case</li>
                    <li>Water resistant up to 50m</li>
                    <li>{selectedWatch.category === 'smart' ? 'Heart rate monitoring' : 'Precision quartz movement'}</li>
                    <li>Scratch-resistant sapphire crystal</li>
                    <li>{selectedWatch.category === 'digital' ? 'Customizable display' : 'Luminous hands and markers'}</li>
                  </ul>
                </div>
                
                <div className="detail-actions">
                  <button 
                    className="detail-add-to-cart"
                    onClick={() => {
                      addToCart(selectedWatch);
                      setShowProductDetail(false);
                      setShowCart(true);
                    }}
                  >
                    <span className="material-icons">shopping_cart</span>
                    Add to Cart
                  </button>
                  
                  <button 
                    className="detail-buy-now"
                    onClick={() => {
                      addToCart(selectedWatch);
                      setShowProductDetail(false);
                      setShowCart(true);
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 CyberWatch. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  )
}

export default App
