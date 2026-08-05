"use client";
import Image from "next/image";
import Link from "next/link";
import SocialSignup from "../SocialSignup";

const Signup = () => {
  return (
    <>
      <section className="pb-17.5 pt-17.5 lg:pb-22.5 xl:pb-27.5">
        <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
          <div className="wow fadeInUp rounded-3xl bg-white/[0.05]">
            <div className="flex">
              <div className="hidden w-full lg:block lg:w-1/2">
                <div className="relative py-20 pl-17.5 pr-22">
                  <div className="absolute right-0 top-0 h-full w-[1px] bg-linear-to-b from-white/0 via-white/20 to-white/0"></div>

                  <h2 className="mb-10 max-w-[292px] text-heading-4 font-bold text-white">
                    Unlock the Power of Writing Tool
                  </h2>
                  <div className="relative aspect-61/50 w-full max-w-[427px]">
                    <Image src="/images/signin/sigin.svg" alt="signin" fill />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <div className="py-8 pl-8 pr-8 sm:py-20 sm:pl-21 sm:pr-20">
                  <div>
                    <SocialSignup />

                    <p className="mt-5 text-center font-medium text-white">
                      Already have an account?{" "}
                      <Link href="/auth/signin" className="text-purple">
                        Sign in Here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
