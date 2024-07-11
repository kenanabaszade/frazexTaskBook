import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutList, setCheckoutList] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const config = {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          };

          const response = await axios.get(
            "https://bookbuzz.inloya.com/api/v1/product/explore",
            config
          );
          setProducts(response.data.result.products);
          setFilteredProducts(response.data.result.products);
        } else {
          setError("No token available.");
        }
      } catch (error) {
        console.error("Fetch products error:", error);
        setError("Failed to fetch products.");
      }
    };

    fetchProducts();
  }, []);

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token available.");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(
        `https://bookbuzz.inloya.com/api/v1/product/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        config
      );

      if (
        response.status === 200 &&
        response.data &&
        !response.data.isError &&
        response.data.result
      ) {
        setFilteredProducts(response.data.result.products);
      } else {
        setError("No products found.");
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("Failed to search products.");
    }
  };

  const addToCheckout = (productId: number) => {
    const existingItem = checkoutList.find((item) => item.id === productId);

    if (existingItem) {
      const updatedList = checkoutList.map((item) =>
        item.id === productId ? { ...item, count: item.count + 1 } : item
      );
      setCheckoutList(updatedList);
    } else {
      const productToAdd = products.find((product) => product.id === productId);
      setCheckoutList([...checkoutList, { ...productToAdd, count: 1 }]);
    }
  };

  const removeFromCheckout = (productId) => {
    const updatedList = checkoutList
      .map((item) =>
        item.id === productId ? { ...item, count: item.count - 1 } : item
      )
      .filter((item) => item.count > 0);
    setCheckoutList(updatedList);
  };

  const handleCheckout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.post(
          "https://bookbuzz.inloya.com/api/v1/shop/checkout",
          { products: checkoutList },
          config
        );

        console.log(response);

        if (!response.data.isError) {
          console.log("Checkout successful!");
          setCheckoutList([]);
          setOpenDialog(true);
        } else {
          setError("Checkout failed.");
        }
      } else {
        setError("No token available.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setError("Failed to checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  return (
    <Container>
      <TextField
        label="Search products"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <Button variant="contained" color="primary" onClick={handleSearch}>
        Search
      </Button>
      {error && <Typography variant="body1">{error}</Typography>}
      <Grid container spacing={4}>
        {filteredProducts.map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="140"
                image={product.mainImage}
                alt={product.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.subtitleShort}
                </Typography>
                <Typography variant="body1">${product.price}</Typography>
              </CardContent>
              <Button
                variant="contained"
                color="primary"
                onClick={() => addToCheckout(product.id)}
              >
                Add to Cart
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        color="primary"
        onClick={handleCheckout}
        disabled={checkoutList.length === 0 || checkoutLoading}
      >
        Checkout ({checkoutList.reduce((total, item) => total + item.count, 0)})
      </Button>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleLogout}
        style={{ marginTop: 10 }}
      >
        Logout
      </Button>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Checkout Successful</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Your order has been successfully placed.
          </Typography>
          <List>
            {checkoutList.map((item) => (
              <ListItem key={item.id}>
                <ListItemText
                  primary={item.title}
                  secondary={`Quantity: ${item.count}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductsPage;
