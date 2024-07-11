import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
} from "@mui/material";

const ProductDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          `https://bookbuzz.inloya.com/api/v1/product/details?productId=${id}`,
          config
        );
        if (!response.data.isError) {
          setProduct(response.data.result);
        } else {
          console.error(
            "Error fetching product details:",
            response.data.errorMessage
          );
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  console.log(product);
  if (!product) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Card>
        <CardMedia
          component="img"
          height="300"
          image={product.mainImage}
          alt={product.title}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {product.title}
          </Typography>
          <Typography variant="h6" gutterBottom>
            {product.subtitleShort}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {product.subtitleLong}
          </Typography>
          <Typography variant="h5">${product.price}</Typography>
          <Typography variant="body2">{product.numOfLikes} likes</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProductDetails;
