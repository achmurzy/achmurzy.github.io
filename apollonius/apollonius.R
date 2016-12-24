#Circles are specified as a triple (k, x*k, y*k)
#The last two terms allow us to perform a translation 
#based on the position of the initial containing circle

#Measurements are in meters. We are still thinking about trees
#Our patch size is 1000m^2. 
#We can still interpret negative radius literally, just denotes internal tangents

#Get your fucking shit together and write a program that can compute and store
#these circles in a fucking .csv
#love you, this is an interesting project and you can achieve it if you are curious and persistent
appollonians = data.frame()

appollonian_1 = c(-4, , 500)
appollonian_2 = c(9,
appollonian_3 = c(9, 

positiveDescartes <- function(A_k, B_k, C_k)
{
    return (A_k + B_k + C_k + 2*sqrt(A_k*B_k + B_k*C_k + A_k*C_k))
}

negativeDescartes <- function(A_k, B_k, C_k)
{
    return (A_k + B_k + C_k - 2*sqrt(A_k*B_k + B_k*C_k + A_k*C_k))
}

appollonianSpheres(A_k, B_k, C_k)
{
    curve1 = positiveDescartes(A_k, B_k, C_k)
    curve2 = negativeDescartes(A_k, B_k, C_k)

    appollonianSpheres(
}
