#Implementing Descartes' theorem for calculating curvature(radii) and x, y coordinates
descartes_positive <- function(c1, c2, c3)
            {
                return (c1 + c2 + c3 + (2 * sqrt((c1*c2) + (c2*c3) + (c1*c3))))   
            }
descartes_negative <- function(c1, c2, c3)
            {
                return (c1 + c2 + c3 - (2 * sqrt((c1*c2) + (c2*c3) + (c1*c3))))    
            }
            
descartes_complex_positive <- function(c1, c2, c3, c4, z1, z2, z3)
            {
                return (((c1*z1) + (c2*z2) + (c3*z3) + (2 * sqrt((c1*c2*z1*z2) + (c2*c3*z2*z3) + (c1*c3*z1*z3)))) / c4) 
            }
            
descartes_complex_negative <- function(c1, c2, c3, c4, z1, z2, z3)
            {
                return (((c1*z1) + (c2*z2) + (c3*z3) - (2 * sqrt((c1*c2*z1*z2) + (c2*c3*z2*z3) + (c1*c3*z1*z3)))) / c4) 
            }
            
#Takes row indices to recursively compute a gasket
apollonians <- function(c1, c2, c3, step, flip)
            {
                step = step + 1
                iter = get("Iterations", envir=.GlobalEnv)
                if (step > iter)
                {
                    return()
                }
                epsilon = get("Epsilon", envir=.GlobalEnv)
                opaque = (flip + (1/iter))

                A_gasket <- get("A_gasket", envir=.GlobalEnv)
                curv1 = 1/A_gasket[c1,]$RADIUS
                curv2 = 1/A_gasket[c2,]$RADIUS
                curv3 = 1/A_gasket[c3,]$RADIUS
                circle_1_k = descartes_positive(curv1, curv2, curv3)
                circle_2_k = descartes_negative(curv1, curv2, curv3)

                comp1 <- complex(real = A_gasket[c1,]$X, imaginary = A_gasket[c1,]$Y)
                comp2 <- complex(real = A_gasket[c2,]$X, imaginary = A_gasket[c2,]$Y)
                comp3 <- complex(real = A_gasket[c3,]$X, imaginary = A_gasket[c3,]$Y)

                #Four recursion trees representing all possible solution combinations
                #for Descartes' theorem. These trees share solutions, representing
                #re-entry along the gasket.

                if(1/circle_1_k > 0.001)
                {
                    circle_1_z_p = descartes_complex_positive(curv1, curv2, curv3, 
                                    circle_1_k, comp1, comp2, comp3)
                    
                    if(checkTangent(curv1, comp1, circle_1_k, circle_1_z_p, epsilon) &&
                        checkTangent(curv2, comp2, circle_1_k, circle_1_z_p, epsilon) &&
                            checkTangent(curv3, comp3, circle_1_k, circle_1_z_p, epsilon))
                    {
                        if(checkDuplicate(A_gasket, circle_1_z_p, epsilon))
                            return()

                        ind <- addCircle(1/circle_1_k, Re(circle_1_z_p), Im(circle_1_z_p), flip)

                        apollonians(c1, c2, ind, step, opaque)
                        apollonians(c1, ind, c3, step, opaque)
                        apollonians(ind, c2, c3, step, opaque)
                    } 

                    circle_1_z_n = descartes_complex_negative(curv1, curv2, curv3, 
                                     circle_1_k, comp1, comp2, comp3)
                    
                    if(checkTangent(curv1, comp1, circle_1_k, circle_1_z_n, epsilon) &&
                        checkTangent(curv2, comp2, circle_1_k, circle_1_z_n, epsilon) &&
                            checkTangent(curv3, comp3, circle_1_k, circle_1_z_n, epsilon))
                    {        
                        if(checkDuplicate(A_gasket, circle_1_z_n, epsilon))
                            return()

                        ind <- addCircle(1/circle_1_k, Re(circle_1_z_n), Im(circle_1_z_n), flip)

                        apollonians(c1, c2, ind, step, opaque)
                        apollonians(c1, ind, c3, step, opaque)
                        apollonians(ind, c2, c3, step, opaque)    
                    }
                }

                if(1/circle_2_k > 0.001)
                {
                    circle_2_z_p = descartes_complex_positive(curv1, curv2, curv3, 
                                     circle_2_k, comp1, comp2, comp3)
                    
                    if(checkTangent(curv1, comp1, circle_2_k, circle_2_z_p, epsilon) &&
                        checkTangent(curv2, comp2, circle_2_k, circle_2_z_p, epsilon) &&
                            checkTangent(curv3, comp3, circle_2_k, circle_2_z_p, epsilon))
                    {
                        if(checkDuplicate(A_gasket, circle_2_z_p, epsilon))
                            return()

                        ind <- addCircle(1/circle_2_k, Re(circle_2_z_p), Im(circle_2_z_p), flip)

                        apollonians(c1, c2, ind, step, opaque)
                        apollonians(c1, ind, c3, step, opaque)
                        apollonians(ind, c2, c3, step, opaque)
                    }

                    circle_2_z_n = descartes_complex_negative(curv1, curv2, curv3, 
                                    circle_2_k, comp1, comp2, comp3)
                    
                    if(checkTangent(curv1, comp1, circle_2_k, circle_2_z_n, epsilon) &&
                        checkTangent(curv2, comp2, circle_2_k, circle_2_z_n, epsilon) &&
                            checkTangent(curv3, comp3, circle_2_k, circle_2_z_n, epsilon))
                    {
                        if(checkDuplicate(A_gasket, circle_2_z_n, epsilon))
                            return()

                        ind <- addCircle(1/circle_2_k, Re(circle_2_z_n), Im(circle_2_z_n), flip)

                        apollonians(c1, c2, ind, step, opaque)
                        apollonians(c1, ind, c3, step, opaque)
                        apollonians(ind, c2, c3, step, opaque)
                    } 
                }  
                
                return()
            }

#Very tricky: '&' vectorized logical AND 'elementwise comparisons'.
#Two conditions are technically logical vectors
checkDuplicate <- function(ag, circle_z, epsilon)
            {
                age <- get("A_gasket", envir=.GlobalEnv)
                if(length(which(abs(age$X-Re(circle_z)) < epsilon & 
                                abs(age$Y-Im(circle_z)) < epsilon)) == 0)
                {
                    return (FALSE)
                }
                
                return (TRUE)
            }

checkTangent <- function(curv, comp, circle_k, circle_z, epsilon)
            {
                dx = Re(circle_z) - Re(comp)
                dy = Im(circle_z) - Im(comp)
                dr = 1/circle_k + 1/curv
                dist = sqrt(dx*dx + dy*dy)
                return(abs(dist - abs(dr)) < epsilon)
            }
            
addCircle <- function(r, x, y, c)
            {
                ag <- rbind(get("A_gasket", envir=.GlobalEnv), 
                    data.frame(RADIUS=r, X=x, Y=y, OPAQUE=c))
                assign("A_gasket", ag, envir = .GlobalEnv)
                return (nrow(ag))
            }

#Takes initial radii ( r < 0.5 ) of two circles to start recursion
#Computes positions of both, assumes c1 is vertically aligned with
#center of inscribing circle fixed at (0.5, 0.5).
initApollonians <- function(r1, r2)
            {
                if (r1 + r2 > 0.5)
                    {
                        print("Smaller radii needed for subdivision")
                        return()
                    }
                    
                x1 <- 0.5
                y1 <- r1
                
                a <- r1 + r2
                b <- 0.5 - r2
                c <- 0.5 - r1

                alphaAngle = acos(((b)**2 + (c)**2 - (a)**2) / (2*b*c))

                #Rotate normalized vector
                nx2 <- sin(alphaAngle)
                ny2 <- 0 - cos(alphaAngle)
                
                #Extend by radius difference - ensure tangent to container
                x2 <- 0.5 + (nx2 * b)
                y2 <- 0.5 + (ny2 * b)

                iter = get("Iterations", envir=.GlobalEnv)
                addCircle(-0.5, 0.5, 0.5, (1/iter))
                addCircle(r1, x1, y1, (1/iter))
                addCircle(r2, x2, y2, (1/iter))
                
                return()
            }
            
gasket <- function(r1, r2, iters, epsilon)
            {
                assign("A_gasket", 
                    data.frame(RADIUS = numeric(), X = numeric(),
                     Y = numeric(), OPAQUE=numeric()), 
                        envir = .GlobalEnv)
                assign("Iterations", iters, envir = .GlobalEnv)
                assign("Epsilon", epsilon, envir = .GlobalEnv)
                initApollonians(r1, r2)
                apollonians(1, 2, 3, 0, (1/get("Iterations", envir=.GlobalEnv)))
                
                ag <- get("A_gasket", envir=.GlobalEnv)
                ag <- ag[!duplicated(ag[,2:3]),]
                write.csv(ag, file="apollonians.csv")

            }

gasket(0.25, 0.25, 10, 10^(-4))
